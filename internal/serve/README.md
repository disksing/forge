# Forge Web 服务

`internal/serve` 提供静态 Web UI、Workspace HTTP API，以及以资源 generation 为边界的 AgentHub 对话、输入、审批、停止、恢复和对账。Workspace 文件操作直接调用 `internal/app`，不会启动 `forge` 子进程。

Generation 生命周期的 canonical facts、operation 优先级、网络 effect 与 guarded commit 边界见 [`generation_lifecycle.md`](generation_lifecycle.md)。planner 是纯决策层；resource controller 串行化同一稳定 resource 的调度；store adapter 负责 durable receipt/current/retired 事实；AgentHub client 只负责网络副作用。统一恢复顺序为 `facts → plan → effect → guarded commit → replan`，旧 generation 的过期结果不得覆盖新 current。

## 配置与所有权

持久化 GUI 配置使用 schema version 4，包含 Workspace、AgentHub endpoint、Forge instance ID、Profile 路由，以及新建 Workspace/Project/Task 的分类型默认 Profile。Application、CLI 和 GUI 创建资源时都读取持久化到 Workspace 的同一组默认值；类型默认不可解析时使用全局 `default`。读取 version 3 时会补齐三个 `default` 并写回 version 4。每个 Workspace 可保存一个内置图标键；缺失或未知值回退为 Forge 默认图标。Settings 的 `User` 页签把用户名保存在当前浏览器的 `localStorage` 中，不进入服务配置或 Workspace 数据。

可用环境变量：

```text
FORGE_AGENTHUB_URL  AgentHub endpoint override
FORGE_GUI_CONFIG    GUI configuration file path
```

每个被管理的 Workspace 同时只能由一个 `forge serve` 进程持有。服务启动时为配置中的每个 Workspace 获取 `<workspace>/.forge/serve.lock` 的 OS advisory 独占锁，并在整个生命周期内保持文件描述符打开。锁冲突会让启动整体失败并释放本轮已取得的锁。

## Workspace 与模板 API

项目、任务、日志、归档、文件预览、Wiki、diff 和模板路由都以显式 Workspace ID 为作用域。结构化模板由 `internal/app` 校验和渲染；`POST .../tasks/preview` 返回最终标题、Markdown 和模板来源/digest，创建时可提交 `expectedTemplateDigest` 防止预览后模板发生变化。

Scheduler API 同样委托 `internal/app`，提供 `GET/POST .../scheduler`、`PUT/DELETE .../scheduler/{scheduleId}` 与 `PUT .../scheduler/settings`。Server 不解析自然语言 condition；GUI 使用这些接口维护调度项、独立绑定和唤醒间隔。

## Resource generation and AgentHub facts

每个 Workspace、Scheduler、Project、Task 都持久化显式 `{kind: profile|agent, name}` 绑定，不做父级继承。资源聊天在首条消息到达时懒创建代际；Forge 使用 Workspace 稳定 instance ID、资源 ID、代际编号/ID、绑定与 Profile revision 组成 AgentHub source metadata，并用代际 ID 幂等建会。浏览器输入携带稳定 `messageId`、provenance `role=user` 和当前用户名；这些来源字段不参与认证或授权。

资源代际按资源拆分保存在 `<workspace>/.forge/runtime/resources/<resource-key>/`：`current.json` 是唯一可变 current，`generations/` 保存不可变 retired manifest；resource key 由稳定 Workspace instance ID 与规范化 resource ID 编码而成，与 Workspace 路径无关。`generation-store.json` 是版本化迁移 marker，旧的 `.forge/runtime/generations.json` 与 `.forge/gui-agent/runs.json` 会保留为 rollback evidence，缺少 `generationId` 的记录只进入 cold history，不进入 lifecycle reconcile。同一资源目录还包含原子提交的 `hot.json`、`receipts.json`、`outbox.json`、`scheduler.json` 和 `commit.json`：hot 只保留 `queued`/`delivering`/`interrupting`、结果不明、待重试、未收敛 notification/outbox 或 Scheduler Turn 终态观察所需的完整消息；普通终态进入不含正文的最小 receipt。receipt 固定最多 2,048 条且保留七天，另有同样有界的过期 ID 索引；过期索引内的查询返回 `message_receipt_expired`/HTTP 410，索引再次过期后才返回 `message_not_found`。`.message-locations/` 只是可重建的查找加速索引，资源文档才是事实源。HTTP 只有在资源文档临时文件完成 write + fsync + rename 且提交目录 fsync 后才返回 accepted。升级时先将 generation、mailbox schema v1/v2 与旧 `pendingMessages` 分资源 staging，再写资源文档、清空已迁移队列，最后写 durable marker；按稳定 ID 重试不会丢失或复制消息。

三种模式共享同一 reconciler：`steer` 默认在支持能力的活动 Turn 中插入，不支持时持久降级为 `enqueue`；`enqueue` 只在 ready 边界作为新 Turn 投递；`interrupt` 先记录被中断的稳定 Turn ID，只重试同一 Turn 的中断，确认其 terminal 后再开启新 Turn。已经处于 delivering/interrupting 的结果不明项最先收敛；其余项按 interrupt、steer、enqueue 优先级处理，同一类保持接受顺序，因此显式 steer/interrupt 可以越过早先等待的 enqueue。AgentHub 成功承担至少一次投递责任后状态才变为 delivered；这不表示 Turn 已完成。绑定替换不再搬运消息：steer 成功后留在旧 Turn，enqueue 等新 generation，interrupt 终止旧 Turn 后再随 replacement 收敛。归档资源拒收新消息；尚未开始发送的项进入 `undeliverable`，已开始发送但无法确认结果的项进入 `delivery_unknown`，两种终态都可按 message ID 查询。

### 工作对象状态与消息 API

公共资源入口仍以 Server 已拥有的 Workspace ID 为作用域，但目标只使用稳定资源 ID `workspace`、`projectN` 或 `projectN.taskN`，不要求 run ID 或 AgentHub Session ID；generation/Turn 只通过返回的稳定 ID/ref 关联：

```text
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/status
POST /api/workspaces/{workspaceId}/resources/{resourceId}/messages
GET  /api/workspaces/{workspaceId}/messages/{messageId}
POST /api/workspaces/{workspaceId}/messages/{messageId}/steer
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/history/turns
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/history/turns/{turnRef}
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/history/events/{eventRef}
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/events
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/stream
POST /api/workspaces/{workspaceId}/resources/{resourceId}/approval
POST /api/workspaces/{workspaceId}/resources/{resourceId}/turn/end
POST /api/workspaces/{workspaceId}/resources/{resourceId}/uploads
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/attention
PUT  /api/workspaces/{workspaceId}/resources/{resourceId}/attention
POST /api/workspaces/{workspaceId}/resources/{resourceId}/attention/dismiss
```

`GET /api/workspaces/{workspaceId}/tree` 还会返回由服务端计算的 `attentionList`。资源树快照包含 `attention.followed` 与 `attention.dismissedTurn`，runtime 快照包含资源级的 `turnNumber`、`activeTurn` 和 `turnStartedAt`。列表始终包含有活动 Turn 的资源，Web 在运行中不显示 dismiss 控件；`activeTurn` 以 AgentHub Session 的 `running`/`waiting_approval` 状态为准，ready/stopped 快照即使残留上一个 `currentTurnId` 也会被清理。Activity 先列出 active 资源：active 组按当前 Turn 的 `turnStartedAt` 倒序，idle 组按最近规范终态的 `completionAt` 倒序，同时间再按标题和资源 ID 稳定排序；输出和轮询变化的 `updatedAt` 不参与排序。Turn 结束后，只有已关注且当前资源 turn ordinal 大于 dismiss ordinal 的资源继续保留。缺少 `dismissedTurn` 表示用户从未 dismiss 过该资源。`PUT .../attention` 接收 `{ "followed": true|false }`；重新关注会清除 dismiss 边界，使资源立即可见。`POST .../attention/dismiss` 记录当前资源 turn ordinal。创建 Project/Task 和向任意资源发送已接受的消息都会自动关注对应资源。关注状态持久化在 `.forge/gui-state.json`，浏览器写入导航 UI 状态时会保留该字段。

发送正文示例：

```json
{
  "text": "Review the current implementation.",
  "mode": "steer",
  "role": "agent",
  "sender": { "id": "project1.task1", "name": "project1.task1" },
  "senderWorkspaceInstanceId": "ws-0123456789abcdef",
  "subscribeResult": true
}
```

发送响应包含 `messageId`、`resourceId`、正文（仍在 hot 中时）、`receipt` 标记、`requestedMode`、`actualMode`、`downgradeReason`、对外消息状态、接受/提升时间、可再次 GET 的 `reference`、当前 generation/Turn 关联、`subscribeResult`/订阅状态以及可选的 `lastErrorCode`/`lastError`。结构化回传还包含 `type`、`causation` 和源消息上的 `notification` receipt。内部 `queued` 对外映射为 `waiting`。`GET .../messages/{messageId}` 对保留的冷 receipt 返回无正文但带 `receipt: true` 的诊断结果；超过 retention 返回稳定 `message_receipt_expired`（HTTP 410），不把已存在的消息伪装成从未存在。状态响应的公共状态只会是 `idle`、`working`、`attention_required`、`unavailable` 或 `archived`；消息等待数与 `waitingMessages` 单列，不会把 Task 标成 queued。状态不再展示 creator；显式绑定、当前 generation/replacement、Turn/steer capability 和最近错误仍可诊断。`POST .../steer` 仅在活动 Turn 支持 steer 时把同一个 waiting mailbox 项立即插入，不创建新消息。稳定错误 code 还包括 `message_not_waiting`、`steer_unavailable` 和 `message_receipt_expired`。provenance 只是来源元数据，不构成认证、授权或指令优先级。

curl 示例：

```bash
curl -sS http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/resources/project1.task2/status
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"text":"Please review this.","mode":"enqueue","role":"agent","sender":{"id":"project1.task1"},"senderWorkspaceInstanceId":"ws-0123456789abcdef"}' \
  http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/resources/project1.task2/messages
curl -sS http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/messages/MESSAGE_ID
curl -sS -X POST http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/messages/MESSAGE_ID/steer
```

绑定或 Profile 映射变化会标记旧代际替换：活动 Turn 先完成，之后底层 AgentHub Session stop 并 archive，新代际按需创建。删除仍被引用的自定义 Profile 不会改写资源显式绑定；解析按资源类型默认、再按全局 `default` 回退，同时在 generation 暴露 `agentConfigError` 和实际 `resolvedProfile`。原 Profile 恢复后周期 reconciler 会重新收敛。

Forge 定期从 AgentHub 拉取 Session 状态并以同一 desired-state reconciler 更新 durable generation 记录、Profile 解析和全部资源 runtime。Task 或 Project 归档首先以一个可恢复的顶层目录移动提交事实；它不因活动 Turn、queued/hot mailbox 或 Stop/Archive 的未知失败而阻断。Project 子树中的所有 generation 随后由 resource planner/reconciler 异步执行 Stop、确认 `stopped`、Archive；未知响应、服务重启和中间状态均由持久事实与重复 reconcile 恢复。Forge 不再创建或删除 `forge-sessions.json` 生命周期投影。

同一周期 reconciler 还读取每个 Workspace 的 `scheduler.json` 并生成稳定、enqueue-only 的 `scheduler_tick` mailbox 消息；该消息显式以 `requestedMode=enqueue`、`actualMode=enqueue`、`ModeFrozen=true` 接受，不能被生成消息公共 helper 改成 `steer`。空列表不会生成消息；配置变化在 Scheduler 忙碌时最多保留一个 waiting tick。间隔基准只接受由 Server tick 触发且 canonical 状态为 `completed` 的 Turn 结束时间，普通用户 Turn 不会重置计时；失败 tick 和无法恢复历史的 tick 使用恢复原因重新唤醒。资源级 `scheduler.json` checkpoint 保留最近 tick 的稳定 ID、generation/Session/Turn、配置 digest 和 delivery/Turn terminal 边界，即使 tick receipt 已 compact，Server 重启也不会重复或丢失恢复判断。

资源 generation 的创建、AgentHub 绑定和生命周期由资源级 API 与 reconciler 负责；不再存在独立的 Forge Session store 或写入 API。资源级 Session Lock 已删除；资源聊天由单一当前代际串行化，GUI 不再提供 Session 新建、切换、恢复或关闭控件。内部 lifecycle controller 仍保留 AgentHub Session 的 Stop/Resume effect；这不是用户级 Session API，也不建立旁路恢复状态机。

ready 的 current generation 在连续空闲 30 分钟且没有活动 Turn/approval、待处理 mailbox 投递或生命周期收敛时由 Forge 自动休眠。空闲边界持久化在 generation 记录中，reconciler 会重新核对精确 AgentHub Session，在资源/Turn 互斥边界内执行 Stop；确认 durable `stopped` 后仍保留同一 current generation/Session，公共 runtime 标记为 `idle-suspended`。之后的 user、agent、system 或 Scheduler 消息保留在 mailbox，按同一 planner 规划幂等 Resume，确认原 Session ready 后再投递；Forge 或 AgentHub 重启后观察到的 `requested`/`daemon_recovery`/idle stopped 统一走这条按需路径。没有消息时保持 stopped，不批量启动 provider。只有 binding/profile 变化、资源归档、Session archived/missing、身份/source 不匹配或 AgentHub 明确报告 provider/native resume 不可恢复，才进入 Stop/Archive/retire 并按需创建新 generation；临时 Resume 失败保留 mailbox 与 receipt，等待下一次 receipt/replan。普通轮询和 Server 重启不会重置计时。

资源历史接口以版本化 base64url opaque reference/cursor 绑定 Workspace instance、资源和 generation。列表跨 generation 反向分页，保留创建时标题、绑定与解析结果；缺失、损坏或暂时不可读的 AgentHub 历史形成显式 gap，单个 gap 不阻断更旧历史。浏览器先加载 Turn 摘要，由视口按需请求详情；只有当前 generation 的开放 Turn 通过资源级 `events` 补齐原始事件并接入 SSE，terminal 后替换为紧凑 Turn。跨 generation 的复合 key、滚动锚点、未读与草稿由 Forge 管理。

AgentHub 的固定 revision `@agenthub/event-timeline` 仍只负责解释当前开放 Turn 的 canonical raw events 和 provider tool semantics；Forge 自己的 adapter 渲染已关闭 Turn 的紧凑 items，不制造伪 canonical events。恢复诊断使用独立 `forge.notice`。上传直接写入目标资源的 `artifacts/upload/`，不会为了上传创建 generation，未发送路径仍留在资源级草稿中。

资源 generation 向 AgentHub Session 注入 `FORGE_WORKSPACE_ROOT`、`FORGE_WORKSPACE_INSTANCE_ID` 和 `FORGE_RESOURCE_ID`，供本地 CLI 验证 Agent sender provenance。创建仍由 CLI 或 GUI 委托 `internal/app` 完成，不经过 mailbox；创建没有初始消息或 generation。每条输入的 `subscribeResult` 省略时默认为 true，实际 delivered 后按 generation+Turn+稳定 sender 建立订阅；同一 sender 在同一 Turn 的多条输入聚合为一条 `turn_result`，payload 带全部源 message IDs，其他 sender 独立投递。`undeliverable`/终态 `delivery_unknown` 会生成 `delivery_terminal_notice`。两类系统通知在 durable accept 时请求 `steer` 且保持 `ModeFrozen=false`，交由普通 mailbox reconcile 按目标活动 Turn 与 steer capability 冻结为 `steer` 或降级为 `enqueue`（分别记录 `no_active_turn`/`steer_unsupported`）；已冻结模式重试不得漂移。结果和终态通知在源资源的独立 outbox 中保存可恢复 operation：目标 mailbox durable accepted 后清空生成正文，只保留 accepted/delivery 摘要，目标 delivery 进入明确终态后删除 operation 并把最小 notification 摘要写入源 receipt。目标 Workspace 必须已注册并由同一 Server 拥有。目标缺失、归档或未注册会写入 receipt 终态，系统生成消息强制 `subscribeResult=false`，不会再生成通知。

持久 schema 升级是无损的：一次性版本化迁移会删除 Workspace/Project/Task 中旧的 `creator`/`createdBy` 字段，并把已 durable 的旧 callback/outbox 类型转换为当前 `turn_result`；已完成历史不会重新批量通知。mailbox schema v1/v2 与 generation pending queue 只执行一次 staging/marker migration，旧 `.forge/runtime/mailbox.json` 保留为回滚证据，不会被新版本继续改写。迁移中断可重试，已提交资源按稳定 ID 合并，marker 只在资源 store 与 pending queue 收敛后写入；旧 Forge 只能回滚到仍理解旧文件的版本，不能在新 marker/store 上继续写入或覆盖新资源文档。`.forge/initializing.json` 表示可重试但尚未完成的 Workspace 初始化，正常打开会拒绝该半成品并提示重新执行 `forge init`。发布前可备份 Workspace；代码回滚不要求改写资源 JSON，回滚前应暂停跨 Workspace 通知。
