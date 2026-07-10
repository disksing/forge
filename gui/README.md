# Forge GUI Agent Providers

Forge GUI 支持多种 agent provider。当前内置：

- **Codex app-server** (`codex`)：默认 provider，通过 `codex app-server` 子进程运行。
- **OpenCode ACP** (`opencode`)：通过 `opencode acp` 子进程运行，使用 ACP（Agent Client Protocol）协议。

## 配置 OpenCode Provider

在 settings 面板的 Agent 标签页中：

1. 启用 `OpenCode` provider。
2. 创建一个新 agent，Provider 选择 `OpenCode`。
3. 可选：配置 model、sandbox、approval 选项。

配置保存后，即可在任务目录启动使用 OpenCode 的交互式或非交互式运行。

## 环境变量

- `FORGE_CODEX_CLI`：自定义 `codex` 可执行文件路径（默认使用 `codex`）。
- `FORGE_OPENCODE_CLI`：自定义 `opencode` 可执行文件路径（默认使用 `opencode`）。

## OpenCode ACP 实现说明

OpenCode provider 作为 ACP Client：

- 启动 `opencode acp` 子进程并通过 stdio JSON-RPC 通信。
- 使用 ACP v1，并校验 OpenCode 返回的协议版本与可选 session capabilities。
- 在 `initialize` 中声明 Client 能力：`fs.readTextFile`、`fs.writeTextFile`、`terminal`。
- 实现 ACP Client 方法：`fs/read_text_file`、`fs/write_text_file`、`terminal/*`、`session/request_permission`。
- 将 `session/update` 通知映射为 forge-gui 事件类型（`assistant_delta`、`tool`、`system` 等）。
- 将 `session/request_permission` 映射为现有审批 UI。
- 文件与终端操作严格限制在 workspace 目录内。
- 非交互式运行结束时，根据 `stopReason` 调用 `forge task run settle`。
- model 会映射到 OpenCode 的 session config option；`read-only` sandbox 会在可用时选择 `plan` mode。

## 验证

默认测试不依赖本机安装 OpenCode：

```sh
go test ./gui/...
```

如已安装并配置 OpenCode，可运行真实 ACP prompt 与文件写入冒烟测试：

```sh
FORGE_TEST_OPENCODE=1 go test -v ./gui -run '^TestOpencodeLivePrompt$'
```

## 多 Provider 管理

多个 provider 可以同时启用。每个 provider 管理自己的子进程；settings 中可单独启停。agent 通过 `providerId` 指定使用哪个 provider。
