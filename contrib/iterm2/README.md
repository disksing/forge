# Forge iTerm2 Toolbelt

`forge_toolbelt.py` is an iTerm2 Python API companion script. It registers a
Toolbelt web view named `Forge` that lists AgentWorkspace projects/tasks and
launches project or task sessions in iTerm2.

The script does not change the Forge CLI. It shells out to:

```bash
forge project list
forge task list <project-id>
```

## Install

1. In iTerm2, choose `Scripts > Manage > New Python Script`.
2. Choose `Full Environment`, name it `ForgeToolbelt`, then create it.
3. Install the web dependency into that script environment:

   ```bash
   ~/Library/ApplicationSupport/iTerm2/Scripts/ForgeToolbelt/iterm2env/versions/*/bin/pip3 install aiohttp
   ```

4. Replace the generated script file with `contrib/iterm2/forge_toolbelt.py`.
5. Run the script from iTerm2's `Scripts` menu.
6. Open the Toolbelt and select `Forge`.

iTerm2 provides the `iterm2` Python package inside full-environment scripts.

## Configure

Create `~/.config/forge-iterm/config.json`:

```json
{
  "workspaces": [
    {
      "name": "AgentWorkspace",
      "path": "/Users/huangmenglong/Documents/AgentWorkspace"
    }
  ],
  "codexCommand": "codex --dangerously-bypass-approvals-and-sandbox",
  "forgePath": "forge",
  "shellPath": "/bin/zsh",
  "server": {
    "host": "127.0.0.1",
    "port": 8797
  }
}
```

You can override the config path with:

```bash
export FORGE_ITERM_CONFIG=/path/to/config.json
```

Each workspace may override the Codex command:

```json
{
  "workspaces": [
    {
      "name": "Safe workspace",
      "path": "/path/to/AgentWorkspace",
      "codexCommand": "codex"
    }
  ]
}
```

## Actions

For every project or task, the Toolbelt shows four actions:

- `New Window`: open a login shell in the selected directory.
- `Split Shell`: split the current pane and `cd` into the selected directory.
- `Window Codex`: open a new window and run the configured Codex command.
- `Split Codex`: split the current pane and run the configured Codex command.

The default Codex command is:

```bash
codex --dangerously-bypass-approvals-and-sandbox
```

That mode intentionally bypasses Codex approvals and sandboxing. Use a safer
`codexCommand` in the config if you do not want that behavior.

## Notes

- Only open projects and tasks are listed. Archived items remain available on disk but are
  not shown by this companion.
- Task directories are resolved from project/task ids, for example
  `project6.task10` maps to `AgentWorkspace/project6/project6.task10`.
- The local web server binds to `127.0.0.1`. If the configured port is busy,
  the script tries the next 19 ports.
