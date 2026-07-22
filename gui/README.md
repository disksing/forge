# Forge GUI Agent Providers

Forge GUI 支持多种 agent provider。当前内置：

- **Codex app-server** (`codex`)：默认 provider，通过 `codex app-server` 子进程运行。
- **OpenCode ACP** (`opencode`)：通过 `opencode acp` 子进程运行，使用 ACP（Agent Client Protocol）协议。
- **Kimi Code ACP** (`kimi`)：通过 `kimi acp` 子进程运行，使用 ACP（Agent Client Protocol）协议。
- **Pi Coding Agent** (`pi`)：每个会话通过独立的 `pi --mode rpc` 子进程运行，使用 pi JSONL RPC 协议。

## 配置 OpenCode Provider

在 settings 面板的 Agent 标签页中：

1. 启用 `OpenCode` provider。
2. 创建一个新 agent，Provider 选择 `OpenCode`。
3. 选择 `build` 或 `plan` mode，并可选配置 OpenCode model。

配置保存后，即可在任务目录启动使用 OpenCode 的交互式或非交互式运行。

## 配置 Kimi Code Provider

先安装 Kimi Code CLI，并在终端运行 `kimi` 完成登录。然后在 GUI 的 System Settings → Agent 中：

1. 启用 `Kimi Code` provider。
2. 创建一个新 agent，Provider 选择 `Kimi Code`。
3. 选择 `build` 或 `plan` mode，并可选配置 Kimi Code model。

Forge 优先从 `FORGE_KIMI_CLI` 和 GUI 进程的 `PATH` 查找命令；若均未找到，会自动尝试 Kimi Code 官方安装器使用的 `~/.kimi-code/bin/kimi`，然后执行 `kimi acp`。

## 配置 Pi Coding Agent Provider

先安装 pi CLI，并完成所需模型的登录或 API key 配置。然后在 GUI 的 System Settings → Agent 中：

1. 启用 `Pi Coding Agent` provider。
2. 创建一个新 agent，Provider 选择 `Pi Coding Agent`。
3. 选择 `build` 或 `plan` mode，并可选填写 pi 支持的 model pattern。

Forge 默认从 GUI 进程的 `PATH` 查找 `pi`，也可用 `FORGE_PI_CLI` 指定可执行文件。`plan` mode 会把 pi 的内置工具限制为 `read,grep,find,ls`；`build` mode 使用 pi 默认工具。

agent 只共享名称和 provider 两个公共字段，运行参数保存在 provider 专属的 `options` 中：

- Codex：`model`、`sandbox`、`approval`。
- OpenCode / Kimi Code / Pi Coding Agent：`model`、`mode`（`build` / `plan`）。

settings 会随 provider 动态切换字段，服务端保存时也会过滤不属于该 provider 的 option。
ACP provider 的 model 必须使用 `session/new` 返回的 option value；配置值不存在时，Forge 会终止启动并在错误中列出可用值，不再静默使用 provider 默认模型。

## 环境变量

- `FORGE_CODEX_CLI`：自定义 `codex` 可执行文件路径（默认使用 `codex`）。
- `FORGE_OPENCODE_CLI`：自定义 `opencode` 可执行文件路径（默认使用 `opencode`）。
- `FORGE_KIMI_CLI`：自定义 `kimi` 可执行文件路径（默认使用 `kimi`）。
- `FORGE_PI_CLI`：自定义 `pi` 可执行文件路径（默认使用 `pi`）。
- `FORGE_GUI_CONFIG`：自定义 GUI 配置文件路径。每个运行中的 GUI 会独占其配置文件；测试时如需启动第二实例，必须使用独立配置文件、端口和 workspace。

例如，启动与主 GUI 完全隔离的测试实例：

```sh
FORGE_GUI_CONFIG=/tmp/forge-gui-test/gui.json \
  forge-gui-bin --addr 127.0.0.1:4999 \
  --workspace /tmp/forge-workspace-test
```

如果另一个 GUI 已持有相同配置的锁，新实例会拒绝启动。锁由进程持有，退出或崩溃后由操作系统自动释放。

## ACP Provider 实现说明

OpenCode 与 Kimi Code provider 作为独立 ACP Client：

- 分别启动 `opencode acp` 或 `kimi acp` 子进程并通过 stdio JSON-RPC 通信。
- 使用 ACP v1，并校验 provider 返回的协议版本与可选 session capabilities。
- 在 `initialize` 中声明 Client 能力：`fs.readTextFile`、`fs.writeTextFile`、`terminal`。
- 实现 ACP Client 方法：`fs/read_text_file`、`fs/write_text_file`、`terminal/*`、`session/request_permission`。
- 将 `session/update` 通知映射为 forge-gui 事件类型（`assistant_delta`、`tool`、`system` 等）。
- 将 `agent_thought_chunk` 按 `messageId` 聚合为瞬时 reasoning 内容，在工具调用、回答或回合状态到来后移除；被 reasoning 分隔的工具调用会随之重新合并，usage、available commands 等元数据不进入聊天正文。
- 将 `session/request_permission` 映射为现有审批 UI。
- 文件与终端操作严格限制在 workspace 目录内。
- scheduler turn 结束时读取 AutoRun 的即时状态；若仍为 `running`，记录 retry 并在共享三次预算内继续。
- model 和 mode 会映射到对应 provider 的 session config options。

## Pi RPC Provider 实现说明

- 每个 Forge run 启动一个工作目录隔离的 `pi --mode rpc` 子进程，因此支持多会话并发。
- 使用 `get_state` 获取并持久化 pi session id，恢复时通过 `--session` 重新打开。
- 将 `prompt`、`steer` 和 `abort` 分别映射到 Forge 的新 prompt、运行中输入和停止操作。
- 将 pi 的文本、thinking、tool execution 和 `agent_settled` 事件映射到现有聊天事件与 AutoRun 回合状态。

## 验证

默认测试使用假 ACP/RPC 子进程覆盖 Kimi Code 和 Pi 会话，不依赖本机安装这些 CLI：

```sh
go test ./gui/...
```

如已安装并配置 OpenCode，可运行真实 ACP prompt 与文件写入冒烟测试：

```sh
FORGE_TEST_OPENCODE=1 go test -v ./gui -run '^TestOpencodeLivePrompt$'
```

## 多 Provider 管理

多个 provider 可以同时启用。每个 provider 管理自己的子进程；settings 中可单独启停。agent 通过 `providerId` 指定使用哪个 provider。
