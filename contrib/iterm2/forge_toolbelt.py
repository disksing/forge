#!/usr/bin/env python3
"""iTerm2 Toolbelt companion for Forge AgentWorkspace tasks.

Install this as an iTerm2 Python API full-environment script. It starts a small
localhost web app, registers it as an iTerm2 Toolbelt web view, lists Forge
tasks/subtasks, and launches shells or Codex sessions for selected task dirs.
"""

from __future__ import annotations

import asyncio
import html
import json
import os
import shlex
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import aiohttp
from aiohttp import web
import iterm2


CONFIG_PATH = Path(
    os.environ.get(
        "FORGE_ITERM_CONFIG",
        str(Path.home() / ".config" / "forge-iterm" / "config.json"),
    )
)
DEFAULT_CODEX_COMMAND = "codex --dangerously-bypass-approvals-and-sandbox"
DEFAULT_SHELL = os.environ.get("SHELL", "/bin/zsh")
TOOL_IDENTIFIER = "com.disksing.forge.toolbelt"


@dataclass(frozen=True)
class Workspace:
    name: str
    path: Path
    codex_command: str


@dataclass(frozen=True)
class Config:
    forge_path: str
    shell_path: str
    codex_command: str
    host: str
    port: int
    workspaces: list[Workspace]


@dataclass(frozen=True)
class TaskRow:
    task_id: str
    title: str


class ToolbeltState:
    def __init__(self, connection: iterm2.Connection, config: Config) -> None:
        self.connection = connection
        self.config = config
        self.last_message = ""


def load_config() -> Config:
    raw: dict[str, Any] = {}
    if CONFIG_PATH.exists():
        raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))

    codex_command = str(raw.get("codexCommand", DEFAULT_CODEX_COMMAND))
    server = raw.get("server", {})
    workspaces = []
    for entry in raw.get("workspaces", []):
        raw_path = str(entry.get("path", "")).strip()
        if not raw_path:
            continue
        path = Path(raw_path).expanduser()
        workspaces.append(
            Workspace(
                name=str(entry.get("name") or path.name),
                path=path,
                codex_command=str(entry.get("codexCommand", codex_command)),
            )
        )

    return Config(
        forge_path=str(raw.get("forgePath", "forge")),
        shell_path=str(raw.get("shellPath", DEFAULT_SHELL)),
        codex_command=codex_command,
        host=str(server.get("host", "127.0.0.1")),
        port=int(server.get("port", 8797)),
        workspaces=workspaces,
    )


async def run_forge(config: Config, workspace: Workspace, args: list[str]) -> str:
    proc = await asyncio.create_subprocess_exec(
        config.forge_path,
        *args,
        cwd=str(workspace.path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        detail = stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(detail or f"forge exited with {proc.returncode}")
    return stdout.decode("utf-8", "replace")


def parse_task_list(output: str) -> list[TaskRow]:
    rows = []
    for line in output.splitlines():
        if not line.strip():
            continue
        task_id, sep, title = line.partition("\t")
        if not sep:
            title = ""
        rows.append(TaskRow(task_id=task_id.strip(), title=title.strip()))
    return rows


async def list_tasks(config: Config, workspace: Workspace) -> list[TaskRow]:
    output = await run_forge(config, workspace, ["task", "list"])
    return parse_task_list(output)


async def list_subtasks(
    config: Config, workspace: Workspace, task_id: str
) -> list[TaskRow]:
    output = await run_forge(config, workspace, ["subtask", "list", task_id])
    return parse_task_list(output)


def task_dir(workspace: Workspace, task_id: str) -> Path:
    parts = task_id.split(".")
    current = parts[0]
    path = workspace.path / current
    for part in parts[1:]:
        current = f"{current}.{part}"
        path = path / current
    return path


def shell_command(shell_path: str, task_path: Path, inner_command: str | None) -> str:
    cd = f"cd {shlex.quote(str(task_path))}"
    if inner_command:
        body = f"{cd} && {inner_command}; exec {shlex.quote(shell_path)} -l"
    else:
        body = f"{cd} && clear; exec {shlex.quote(shell_path)} -l"
    return f"{shlex.quote(shell_path)} -lc {shlex.quote(body)}"


def split_text(task_path: Path, inner_command: str | None) -> str:
    cd = f"cd {shlex.quote(str(task_path))}"
    if inner_command:
        return f"{cd} && {inner_command}"
    return f"{cd} && clear"


async def launch_task(
    state: ToolbeltState,
    workspace: Workspace,
    task_id: str,
    target: str,
    command_kind: str,
) -> None:
    task_path = task_dir(workspace, task_id)
    if not task_path.exists():
        raise RuntimeError(f"task directory does not exist: {task_path}")

    inner_command = None
    if command_kind == "codex":
        inner_command = workspace.codex_command

    app = await iterm2.async_get_app(state.connection)
    await app.async_activate()

    if target == "window":
        command = shell_command(state.config.shell_path, task_path, inner_command)
        await iterm2.Window.async_create(state.connection, command=command)
        return

    window = app.current_terminal_window
    if window is None or window.current_tab is None or window.current_tab.current_session is None:
        command = shell_command(state.config.shell_path, task_path, inner_command)
        await iterm2.Window.async_create(state.connection, command=command)
        return

    base_session = window.current_tab.current_session
    new_session = await base_session.async_split_pane(vertical=True)
    await new_session.async_activate()
    await new_session.async_send_text(split_text(task_path, inner_command) + "\n")


def page(title: str, body: str) -> str:
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>
    :root {{ color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }}
    body {{ margin: 0; padding: 12px; font-size: 13px; }}
    header {{ display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }}
    h1 {{ font-size: 16px; margin: 0; }}
    h2 {{ font-size: 13px; margin: 16px 0 8px; color: #666; text-transform: uppercase; }}
    a {{ color: #0a66c2; text-decoration: none; }}
    .muted {{ color: #777; }}
    .message {{ border-left: 3px solid #0a66c2; padding: 6px 8px; margin: 8px 0; background: rgba(10,102,194,.08); }}
    .danger {{ border-left-color: #c62828; background: rgba(198,40,40,.09); }}
    .row {{ border-top: 1px solid rgba(127,127,127,.25); padding: 9px 0; }}
    .title {{ font-weight: 600; margin-bottom: 3px; }}
    .actions {{ display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 7px; }}
    button {{ width: 100%; border: 1px solid rgba(127,127,127,.35); border-radius: 6px; padding: 5px 6px; background: transparent; color: inherit; font: inherit; cursor: pointer; }}
    button:hover {{ background: rgba(127,127,127,.12); }}
    button.codex {{ border-color: #c62828; color: #c62828; }}
    code {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }}
    pre {{ white-space: pre-wrap; overflow-wrap: anywhere; background: rgba(127,127,127,.12); padding: 8px; border-radius: 6px; }}
  </style>
</head>
<body>
{body}
</body>
</html>"""


def link(url: str, label: str) -> str:
    return f'<a href="{html.escape(url, quote=True)}">{html.escape(label)}</a>'


def task_actions(workspace_index: int, task_id: str) -> str:
    escaped = html.escape(task_id, quote=True)
    return f"""
    <form class="actions" method="post" action="/launch">
      <input type="hidden" name="workspace" value="{workspace_index}">
      <input type="hidden" name="task" value="{escaped}">
      <button name="target" value="window:shell">New Window</button>
      <button name="target" value="split:shell">Split Shell</button>
      <button class="codex" name="target" value="window:codex">Window Codex</button>
      <button class="codex" name="target" value="split:codex">Split Codex</button>
    </form>"""


def render_task_rows(
    workspace_index: int,
    rows: list[TaskRow],
    include_subtask_link: bool,
) -> str:
    if not rows:
        return '<p class="muted">No open items.</p>'
    chunks = []
    for row in rows:
        title = html.escape(row.title or row.task_id)
        task_id = html.escape(row.task_id)
        subtask_link = ""
        if include_subtask_link:
            subtask_link = " · " + link(
                f"/subtasks?workspace={workspace_index}&task={html.escape(row.task_id, quote=True)}",
                "subtasks",
            )
        chunks.append(
            f"""<section class="row">
  <div class="title">{task_id}</div>
  <div>{title}{subtask_link}</div>
  {task_actions(workspace_index, row.task_id)}
</section>"""
        )
    return "\n".join(chunks)


async def handle_index(request: web.Request) -> web.Response:
    state: ToolbeltState = request.app["state"]
    if not state.config.workspaces:
        sample = {
            "workspaces": [
                {
                    "name": "AgentWorkspace",
                    "path": "/Users/huangmenglong/Documents/AgentWorkspace",
                }
            ],
            "codexCommand": DEFAULT_CODEX_COMMAND,
        }
        body = f"""
<header><h1>Forge Toolbelt</h1></header>
<p class="message danger">No workspaces are configured.</p>
<p>Create <code>{html.escape(str(CONFIG_PATH))}</code>:</p>
<pre>{html.escape(json.dumps(sample, indent=2))}</pre>"""
        return web.Response(text=page("Forge Toolbelt", body), content_type="text/html")

    rows = []
    for index, workspace in enumerate(state.config.workspaces):
        rows.append(
            f"""<section class="row">
  <div class="title">{html.escape(workspace.name)}</div>
  <div><code>{html.escape(str(workspace.path))}</code></div>
  <p>{link(f"/tasks?workspace={index}", "Open tasks")}</p>
</section>"""
        )

    message = ""
    if state.last_message:
        message = f'<p class="message">{html.escape(state.last_message)}</p>'
    body = f"""<header><h1>Forge Toolbelt</h1></header>
{message}
<h2>Workspaces</h2>
{''.join(rows)}
<p class="muted">Config: <code>{html.escape(str(CONFIG_PATH))}</code></p>"""
    return web.Response(text=page("Forge Toolbelt", body), content_type="text/html")


async def handle_tasks(request: web.Request) -> web.Response:
    state: ToolbeltState = request.app["state"]
    workspace_index = int(request.query.get("workspace", "0"))
    workspace = state.config.workspaces[workspace_index]
    try:
        rows = await list_tasks(state.config, workspace)
        content = render_task_rows(workspace_index, rows, include_subtask_link=True)
    except Exception as exc:  # noqa: BLE001 - render toolbelt errors in UI.
        content = f'<p class="message danger">{html.escape(str(exc))}</p>'
    body = f"""<header>
  <h1>{html.escape(workspace.name)}</h1>
  {link("/", "Workspaces")}
</header>
<h2>Open Tasks</h2>
{content}"""
    return web.Response(text=page("Forge Tasks", body), content_type="text/html")


async def handle_subtasks(request: web.Request) -> web.Response:
    state: ToolbeltState = request.app["state"]
    workspace_index = int(request.query.get("workspace", "0"))
    task_id = request.query.get("task", "")
    workspace = state.config.workspaces[workspace_index]
    try:
        rows = await list_subtasks(state.config, workspace, task_id)
        content = render_task_rows(workspace_index, rows, include_subtask_link=False)
    except Exception as exc:  # noqa: BLE001 - render toolbelt errors in UI.
        content = f'<p class="message danger">{html.escape(str(exc))}</p>'
    body = f"""<header>
  <h1>{html.escape(task_id)} subtasks</h1>
  {link(f"/tasks?workspace={workspace_index}", "Tasks")}
</header>
{task_actions(workspace_index, task_id)}
<h2>Open Subtasks</h2>
{content}"""
    return web.Response(text=page("Forge Subtasks", body), content_type="text/html")


async def handle_launch(request: web.Request) -> web.Response:
    state: ToolbeltState = request.app["state"]
    form = await request.post()
    workspace_index = int(str(form.get("workspace", "0")))
    task_id = str(form.get("task", ""))
    target, command_kind = str(form.get("target", "split:shell")).split(":", 1)
    workspace = state.config.workspaces[workspace_index]
    try:
        await launch_task(state, workspace, task_id, target, command_kind)
        state.last_message = f"Launched {task_id} as {target} {command_kind}."
    except Exception as exc:  # noqa: BLE001 - render toolbelt errors in UI.
        state.last_message = f"Launch failed: {exc}"
    raise web.HTTPFound(f"/tasks?workspace={workspace_index}")


async def start_site(app: web.Application, host: str, port: int) -> tuple[web.AppRunner, int]:
    runner = web.AppRunner(app)
    await runner.setup()
    for candidate in range(port, port + 20):
        try:
            site = web.TCPSite(runner, host, candidate)
            await site.start()
            return runner, candidate
        except OSError:
            continue
    await runner.cleanup()
    raise RuntimeError(f"no free port found from {port} to {port + 19}")


async def main(connection: iterm2.Connection) -> None:
    config = load_config()
    state = ToolbeltState(connection, config)
    app = web.Application()
    app["state"] = state
    app.router.add_get("/", handle_index)
    app.router.add_get("/tasks", handle_tasks)
    app.router.add_get("/subtasks", handle_subtasks)
    app.router.add_post("/launch", handle_launch)

    _runner, port = await start_site(app, config.host, config.port)
    await iterm2.tool.async_register_web_view_tool(
        connection,
        "Forge",
        TOOL_IDENTIFIER,
        True,
        f"http://{config.host}:{port}/",
    )


iterm2.run_forever(main)
