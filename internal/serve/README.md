# Forge GUI 与 AgentHub

Forge GUI 只通过 AgentHub 执行 agent 和维护会话。Forge 自身不再内置 Codex app-server、ACP、Kimi、OpenCode 或 Pi runner，也不会查找、探测、启动、复用或停止这些 provider CLI。

## 职责边界

Forge 保留以下控制面：

- AgentWorkspace、project、task、artifact、Wiki 与 Git worktree 展示；
- Forge session、资源锁和 AutoRun generation；
- 系统和用户 Profile 到 AgentHub `agentName` 的路由；
- AgentHub durable session 的创建、消息、审批、恢复、停止和 canonical event 投影。

AgentHub 拥有以下执行面：

- provider 与 agent catalog；
- provider CLI 路径、环境变量、模型、mode、sandbox 和 approval 等 provider 专属配置；
- provider 进程生命周期与 provider-native session/event 适配；
- durable agent session 和 canonical event history。

Forge 设置页只读展示 AgentHub catalog。用户只能设置 AgentHub endpoint 和 Forge Profile 路由，不可在 Forge 中新增、编辑、启用或关闭 provider/agent 定义。

## 配置

持久化 GUI 配置使用 schema version 3，仅包含 workspace、AgentHub endpoint、Forge instance ID 和 Profile 路由。每个 workspace 可保存一个可选的内置图标键；缺失、空值或未知值在界面中都回退为 Forge 默认图标，当前 workspace 的图标同时用于浏览器 favicon。配置始终包含不可删除、不可改名或改描述的系统 Profile：`default`、`fast`、`reasoning`、`scheduler`；用户只能为它们选择目标 AgentHub agent，另外可以管理自定义 Profile。`scheduler` 是为未来调度工作预留的系统路由，当前不会自动启动 Scheduler Agent，也不会改变现有 AutoRun 路由。可用环境变量：

- `FORGE_AGENTHUB_URL`：覆盖持久化的 AgentHub endpoint。
- `FORGE_GUI_CONFIG`：GUI 配置文件路径。

Workspace 读写由可复用的 `internal/app` API 完成。服务为每个请求显式打开配置中的 Workspace root，API 返回类型化资源和结构化错误，不通过子进程、argv 或 stdout JSON 传递内部结果。升级时请删除旧的 `FORGE_CLI` 配置；服务不再读取它。

结构化任务模板同样由 `internal/app` 负责。`GET /api/workspaces/<id>/templates?project=<project>` 列出合法和非法模板；单模板读取、未保存内容校验和字段渲染位于对应 `templates` 路由。`POST .../tasks/preview` 返回最终标题、Markdown、模板来源/digest 与本次 AutoRun 配置；创建请求提交 `templateName`、`templateFields` 和可选 `expectedTemplateDigest`，服务端重新加载模板。digest 变化返回 409，所有模板校验错误保留稳定 code、field path 和 issue 数组。

GUI 只读取 schema version 3 配置。缺少 `scheduler` 的既有 version 3 配置会在加载/规范化时自动补齐；若已有 `default` 目标，新的路由会继承该目标，否则沿用系统 Profile 的第一个可用 Agent fallback。规范化结果会持久化，显式保存的目标（包括暂时不可用的目标）会保留。旧版本配置不会被降级展示、自动重写或通过设置页迁移；升级前请先完成一次性转换或备份。目标 Agent 即使暂时不可用也可以保存，实际运行时由 AgentHub 返回错误。

## 会话与锁

新 chat 和 AutoRun 都创建或恢复 AgentHub session。Forge 使用完整 `source.app=forge`、instance ID 和 external ID 对账，并把原始 `FORGE_SESSION_ID` 传入 AgentHub launch environment。手动首次启动和新 generation 通过单个 `POST /api/workspaces/<id>/autorun/start` 收集并持久化 `agentName`、`runInstructions` 和 `completionCriteria`；暂停或挂起恢复保留当前 generation 参数。若当前 Task 没有严格 idle 的可复用 AgentHub session，GUI Resume 必须打开明确的 Agent 选择框；当前 generation 保存且仍可用的 Agent 只能作为预选，用户确认后才恢复，不能读取其他 Task 的最近选择。Forge 在创建 Forge session 或推进 generation 前查询 AgentHub catalog，目标不可用时保持任务、session 和锁不变。

Chat composer 底部只有一个 New Session 按钮。点击后展开当前启用的 AgentHub Agent 列表，并显示 Agent 名称与模型摘要；选择列表项立即为当前资源创建新 Session。没有可用 Agent 时按钮禁用并说明原因，创建过程中显示进行中状态并忽略重复点击，创建失败时保留当前 Session 和选择列表供重试；列表支持 Escape 与点击控件外关闭。

当当前选中的 Project 或 Task 存在 `source=external` 的有效 Session 锁时，composer 按通用 Resource 文案显示锁定提示，隐藏 New Session、Start/Resume AutoRun 和 Resume Session 入口，并暂停输入与上传。外部锁释放后，下一次 tree 刷新恢复正常操作。服务端在创建/恢复 Session、发送输入和手动或调度 AutoRun 的执行路径再次读取同一锁投影；页面过期或直接调用 API 只返回 conflict，不创建 AgentHub session、不推进 AutoRun generation，也不发送消息。

当当前选中的 Project 或 Task 存在 `source=internal` 的有效 Forge GUI Session 锁时，composer 隐藏 New Session 并关闭已展开的 Agent 选择列表；判定依据是该 Resource 的所有 `sessionControls` 锁投影，不依赖当前查看的 Agent Run 或其状态。当前 Session 的输入、审批、Close Session 和 idle Task AutoRun 复用入口保持可用；下一次 tree 刷新观察到锁释放后恢复 New Session。AutoRun 仍只适用于 Task。

AutoRun 进入 `completed`、`failed` 或 `cancelled` 只结束调度回合，不关闭 AgentHub session；session、Forge session 和资源锁会保留到用户明确点击 Close Session。已关闭并释放原 Forge session 的历史 run 不可 resume，因为 AgentHub launch environment 中的原始 `FORGE_SESSION_ID` 已失效，此时应启动新 session。

当前 turn 处于 AgentHub `busy` 或 `waiting_approval` 时，Chat composer 在输入框工具栏提供 End Turn 和 Close Session 两个独立图标操作。End Turn 只调用 AgentHub interrupt，保留 AgentHub session、Forge session 和 Task 锁；服务端会在发送非幂等 interrupt 前重新读取并校验 source、session ID 和当前状态，状态冲突不执行操作。AutoRun/SchedulerTurn 会先以 `user stopped the active turn` 将同一 generation 原子地置为 paused，普通 Chat turn 不修改 AutoRun；interrupt 结果不明确时保守保留 session 并等待对账。Close Session 对当前关联且可取消的 AutoRun generation 先以 `user closed the AutoRun session` 做同一 generation/state 校验并持久化为 cancelled，再调用 AgentHub stop；取消失败不会发送 stop，stop 结果不明确时保持 cancelled 且不重试。已完成、失败、取消或历史 generation 不会误覆盖，普通 Chat Session 行为不变；只有 durable stopped 后才释放锁。取消 generation 时 UI 默认关闭 Session，显式 Cancel AutoRun 则保留 Session。

只有观察到 AgentHub durable `stopped` 后，Forge 才结束对应 Forge session 并释放资源锁；服务错过 stopped 边沿、只看到 archived 时，必须依据连续 durable event history 证明该 session 先经过 stopped 才可释放。AgentHub 不可达、状态未知、event cursor gap、重复或冲突 source、未证明先经过 stopped 的 archived 状态都保守持锁。

`forge serve` 是 AgentHub session 对账和 Forge 锁释放的唯一 owner。普通 Forge CLI（`forge session list/show`、`forge workspace tree`、`forge start`、session create/lock/unlock/heartbeat/end、资源归档等）不会访问 AgentHub；AgentHub 管理的 Forge session 在普通 CLI 看来始终活动，直到服务安全对账或用户显式执行 `forge session end --id=<id>`。服务停止期间这些锁会保守保留。

旧 run 索引和本地 JSONL event 可以由用户自行备份，但当前 Forge 不再读取、展示、迁移或写入这些文件，也不会列出或控制未绑定 AgentHub 的 direct run。

## Event Timeline

REST、历史分页与 SSE 都向浏览器传递 AgentHub API v1 canonical event。浏览器使用 vendored `@agenthub/event-timeline` IIFE 的 `buildTimeline` 进行唯一的过滤、delta 合并、tool payload 解释、call 关联和终态收敛，再由 Forge 的 DOM renderer 展示。

当前固定版本为 1.0.0，AgentHub timeline source revision 为 `a34d8b009c5278d8aa50fcd637ec1d9005bacc28`，IIFE SHA-256 为 `f8b1fa87df04394f617b0ae129c4991f8f401142ebc15a98433dfc184f2ee8eb`。该构建使用 `agentName` 作为唯一 Agent 身份，不再回退到旧 `agentId`。来源信息、上游 manifest 和 BSD-3-Clause 许可证位于 `static/vendor/agenthub-event-timeline/`。从 AgentHub checkout 重建并校验：

```sh
scripts/update-agenthub-event-timeline /path/to/agenthub
```

Forge recovery 和 AutoRun 诊断使用独立 `forge.notice` SSE event，不伪装成 canonical event，也不进入共享 timeline projector。

## Workspace 独占所有权

每个被管理的 Workspace 同时只能由一个 `forge serve` 进程管理。服务在启动 AutoRun scheduler、AgentHub recovery/poller 和 HTTP 写入能力之前，对配置中的每个 Workspace 获取 `<workspace>/.forge/serve.lock` 的 OS advisory 独占锁（flock），并在整个生命周期内保持文件描述符打开。锁冲突时启动整体失败并释放本轮已取得的锁（全有或全无），错误中包含规范 Workspace 路径和 owner 诊断（PID、监听地址、配置路径）。

- 不同 `FORGE_GUI_CONFIG` 不能绕过限制：配置文件锁防止同一配置被两个实例使用，Workspace 锁提供跨配置的资源所有权。
- Workspace 路径在锁定前转为绝对规范路径并解析符号链接，相对路径、`..` 和 symlink 别名指向同一 Workspace 时同样冲突。
- 通过 HTTP API 动态添加 Workspace 时先取锁再持久化配置；保存失败会回滚锁；动态移除会释放锁。重复添加同一 Workspace 不会重复取锁或丢失现有锁。
- 进程正常退出或崩溃后由 OS 自动释放锁，后续实例可直接接管；不会通过删除 lock 文件伪造解锁。
- 未持有锁的实例不会调度、恢复或控制该 Workspace 的 Session，所有管理和写入入口都会验证所有权。
- 普通 `forge project/task/session/workspace/start` CLI 不获取 `serve.lock`，仍按现有 Forge session/resource lock 规则工作。

## 隔离验证

不要用开发构建连接真实 workspace 或修改真实 GUI 配置。测试第二个 GUI 时必须隔离配置、端口和 workspace，并使用 fake AgentHub 或专用测试 AgentHub。第二个实例即使误指向真实 Workspace，也会在启动调度前因 `serve.lock` 冲突明确失败，但测试仍必须使用隔离 Workspace，避免产生真实业务写入：

```sh
FORGE_GUI_CONFIG=/tmp/forge-gui-test/gui.json \
FORGE_AGENTHUB_URL=http://127.0.0.1:14646 \
  forge serve --addr 127.0.0.1:14936 \
  --workspace /tmp/forge-workspace-test
```

常用验证：

```sh
go test ./...
go vet ./...
node --check internal/serve/static/app.js
node --check internal/serve/static/vendor/agenthub-event-timeline/event-timeline.iife.js
git diff --check
```

仓库的静态防回归测试会阻止生产代码重新引入 provider CLI 启动、direct runner selector/fallback、旧设置 API 或新 run 的 legacy provider 字段。
