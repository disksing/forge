# Forge Web 服务

`internal/serve` 提供静态 Web UI、Workspace HTTP API，以及 AgentHub Session 的创建、输入、审批、停止、恢复和对账。Workspace 文件操作直接调用 `internal/app`，不会启动 `forge` 子进程。

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

## AgentHub Session

每个 Workspace、Project、Task 都持久化显式 `{kind: profile|agent, name}` 绑定，不做父级继承。资源聊天在首条消息到达时懒创建代际；Forge 使用 Workspace 稳定 instance ID、资源 ID、代际编号/ID、绑定与 Profile revision 组成 AgentHub source metadata，并用代际 ID 幂等建会。浏览器输入携带稳定 `messageId`、provenance `role=user` 和当前用户名；这些来源字段不参与认证或授权。

资源代际保存在 `<workspace>/.forge/runtime/generations.json`；Workspace 统一、按目标资源归属的 mailbox 保存在 `<workspace>/.forge/runtime/mailbox.json`。mailbox 项记录稳定 message ID、顺序、目标资源、正文、role/sender provenance、requested/actual mode、降级原因、状态、时间、最近错误和 generation/Session/Turn 关联。HTTP 只有在 mailbox 临时文件完成 write + fsync + rename 且目录 fsync 后才返回 accepted。升级时先把 generation 的旧 `pendingMessages` 合并写入 mailbox，再清空旧字段；崩溃后按稳定 ID 重复迁移不会丢失或复制消息。

三种模式共享同一 reconciler：`steer` 默认在支持能力的活动 Turn 中插入，不支持时持久降级为 `enqueue`；`enqueue` 只在 ready 边界作为新 Turn 投递；`interrupt` 先记录被中断的稳定 Turn ID，只重试同一 Turn 的中断，确认其 terminal 后再开启新 Turn。已经处于 delivering/interrupting 的结果不明项最先收敛；其余项按 interrupt、steer、enqueue 优先级处理，同一类保持接受顺序，因此显式 steer/interrupt 可以越过早先等待的 enqueue。AgentHub 成功承担至少一次投递责任后状态才变为 delivered；这不表示 Turn 已完成。绑定替换不再搬运消息：steer 成功后留在旧 Turn，enqueue 等新 generation，interrupt 终止旧 Turn 后再随 replacement 收敛。归档资源拒收新消息；尚未开始发送的项进入 `undeliverable`，已开始发送但无法确认结果的项进入 `delivery_unknown`，两种终态都可按 message ID 查询。

### 工作对象状态与消息 API

公共资源入口仍以 Server 已拥有的 Workspace ID 为作用域，但目标只使用稳定资源 ID `workspace`、`projectN` 或 `projectN.taskN`，不要求 run/generation/AgentHub Session ID：

```text
GET  /api/workspaces/{workspaceId}/resources/{resourceId}/status
POST /api/workspaces/{workspaceId}/resources/{resourceId}/messages
GET  /api/workspaces/{workspaceId}/messages/{messageId}
POST /api/workspaces/{workspaceId}/messages/{messageId}/steer
```

发送正文示例：

```json
{
  "text": "Review the current implementation.",
  "mode": "steer",
  "role": "agent",
  "sender": { "id": "project1.task1", "name": "project1.task1" }
}
```

发送响应包含 `messageId`、`resourceId`、正文、`requestedMode`、`actualMode`、`downgradeReason`、对外消息状态、接受/提升时间、可再次 GET 的 `reference`、当前关联以及可选的 `lastErrorCode`/`lastError`。内部 `queued` 对外映射为 `waiting`。状态响应的公共状态只会是 `idle`、`working`、`attention_required`、`unavailable` 或 `archived`；消息等待数与 `waitingMessages` 单列，不会把 Task 标成 queued。状态还包含显式绑定、当前 generation/replacement、Session/Turn/steer capability 和最近错误。`POST .../steer` 仅在活动 Turn 支持 steer 时把同一个 waiting mailbox 项立即插入，不创建新消息。稳定错误 code 还包括 `message_not_waiting` 和 `steer_unavailable`。provenance 只是来源元数据，不构成认证、授权或指令优先级。

curl 示例：

```bash
curl -sS http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/resources/project1.task2/status
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"text":"Please review this.","mode":"enqueue","role":"agent","sender":{"id":"project1.task1"}}' \
  http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/resources/project1.task2/messages
curl -sS http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/messages/MESSAGE_ID
curl -sS -X POST http://127.0.0.1:4936/api/workspaces/WORKSPACE_ID/messages/MESSAGE_ID/steer
```

绑定或 Profile 映射变化会标记旧代际替换：活动 Turn 先完成，之后旧 Session stop 并 archive，新代际按需创建。删除仍被引用的自定义 Profile 不会改写资源显式绑定；解析按资源类型默认、再按全局 `default` 回退，同时在 generation 暴露 `agentConfigError` 和实际 `resolvedProfile`。原 Profile 恢复后周期 reconciler 会重新收敛。

Forge 定期从 AgentHub 拉取 Session 状态并以同一 desired-state reconciler 更新本地 run 投影、Profile 解析和全部资源 generation。Task 或 Project 归档会收敛其所有 generation；活动 Turn 默认拒绝 GUI 归档，外部归档也会等待 Turn 自然结束，随后执行 Stop、确认 `stopped`、Archive。未知 Stop/Archive 响应、服务重启和中间状态均由重复 reconcile 恢复。只有观察到 durable `stopped`，或从连续事件历史证明 archived Session 曾进入 `stopped`，才删除对应的瞬态 Forge Session 投影。

Session 投影的创建、AgentHub ID 绑定与安全删除只通过 `internal/app` 的 Server 内部 API 完成。公共 CLI 只保留 `forge session list/show` 作为只读诊断，不提供手工创建、绑定、心跳或结束入口，也不会访问 AgentHub。资源级 Session Lock 已删除；资源聊天由单一当前代际串行化，普通显式 GUI Session 控制仍保留作诊断和兼容用途。

`GET .../turns` 和 `GET .../turns/{turnId}` 代理 AgentHub 的紧凑 Turn 投影；`GET .../events` 另支持稳定 `start`/`end` 有界范围。浏览器先反向读取最新 Turn，只为开放 Turn 补齐原始 Events，再从响应的 `latestEventId` 无缺口接入 SSE；terminal 后用物化 Turn 替换直播区间，thinking/tool 展开时再读取范围 Events。恢复诊断使用独立 `forge.notice`，不伪装成 canonical event。
