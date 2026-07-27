# Forge GUI 与 AgentHub

Forge GUI 只通过 AgentHub 执行 agent 和维护会话。Forge 自身不再内置 Codex app-server、ACP、Kimi、OpenCode 或 Pi runner，也不会查找、探测、启动、复用或停止这些 provider CLI。

## 职责边界

Forge 保留以下控制面：

- AgentWorkspace、project、task、artifact、Wiki 与 Git worktree 展示；
- Forge session、资源锁和 AutoRun generation；
- 默认 AgentHub agent 与 Forge Profile 到 AgentHub `agentName` 的路由；
- AgentHub durable session 的创建、消息、审批、恢复、停止和 canonical event 投影。

AgentHub 拥有以下执行面：

- provider 与 agent catalog；
- provider CLI 路径、环境变量、模型、mode、sandbox 和 approval 等 provider 专属配置；
- provider 进程生命周期与 provider-native session/event 适配；
- durable agent session 和 canonical event history。

Forge 设置页只读展示 AgentHub catalog。用户只能设置 AgentHub endpoint、默认 catalog agent 和 Forge Profile 路由，不可在 Forge 中新增、编辑、启用或关闭 provider/agent 定义。

## 配置

持久化 GUI 配置使用 schema version 2，仅包含 workspace、AgentHub endpoint、Forge instance ID、默认 AgentHub agent 和 Profile 路由。可用环境变量：

- `FORGE_CLI`：GUI 调用的 Forge CLI。
- `FORGE_AGENTHUB_URL`：覆盖持久化的 AgentHub endpoint。
- `FORGE_GUI_CONFIG`：GUI 配置文件路径。

旧版 GUI 配置首次迁移时会在相邻位置创建一次性备份：

```text
<gui-config>.pre-agenthub-v1.bak
```

迁移只有在 AgentHub 状态、API 能力和 catalog 校验通过、且旧默认 agent/Profile 都能唯一映射时才会写入。迁移后的新配置不会写回 `agentProviders`、`agents`、provider enable 状态或 provider 专属 option。

## 会话与锁

新 chat 和 AutoRun 都创建或恢复 AgentHub session。Forge 使用完整 `source.app=forge`、instance ID 和 external ID 对账，并把原始 `FORGE_SESSION_ID` 传入 AgentHub launch environment。

只有观察到 AgentHub durable `stopped` 后，Forge 才结束对应 Forge session 并释放资源锁。AgentHub 不可达、状态未知、event cursor gap、重复 source 或未证明先经过 stopped 的 archived 状态都保守持锁。

迁移前的 run 索引和本地 JSONL event 保留在磁盘，但 Forge 不再读取、展示、迁移或写入这些 event，也不会列出或控制未绑定 AgentHub 的旧 direct run。回滚时可由旧二进制继续读取原文件。

## Event Timeline

REST、历史分页与 SSE 都向浏览器传递 AgentHub API v1 canonical event。浏览器使用 vendored `@agenthub/event-timeline` IIFE 的 `buildTimeline` 进行唯一的过滤、delta 合并、tool payload 解释、call 关联和终态收敛，再由 Forge 的 DOM renderer 展示。

当前固定版本为 1.0.0，AgentHub source revision 为 `a5506f27eeef1bfdf414d8c7385faadf299379e7`，IIFE SHA-256 为 `789659286d490d14105f32e281fab9744a57d04cf890f38114afc127d57d9713`。来源信息、上游 manifest 和 BSD-3-Clause 许可证位于 `static/vendor/agenthub-event-timeline/`。从 AgentHub checkout 重建并校验：

```sh
scripts/update-agenthub-event-timeline /path/to/agenthub
```

Forge recovery 和 AutoRun 诊断使用独立 `forge.notice` SSE event，不伪装成 canonical event，也不进入共享 timeline projector。

## 隔离验证

不要用开发构建连接真实 workspace 或修改真实 GUI 配置。测试第二个 GUI 时必须隔离配置、端口和 workspace，并使用 fake AgentHub 或专用测试 AgentHub：

```sh
FORGE_GUI_CONFIG=/tmp/forge-gui-test/gui.json \
FORGE_AGENTHUB_URL=http://127.0.0.1:14646 \
  forge-gui --addr 127.0.0.1:14936 \
  --workspace /tmp/forge-workspace-test
```

常用验证：

```sh
go test ./...
go vet ./...
node --check gui/static/app.js
node --check gui/static/vendor/agenthub-event-timeline/event-timeline.iife.js
git diff --check
```

仓库的静态防回归测试会阻止生产代码重新引入 provider CLI 启动、direct runner selector/fallback、旧设置 API 或新 run 的 legacy provider 字段。
