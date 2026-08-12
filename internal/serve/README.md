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

资源代际与最小入站重试队列保存在 `<workspace>/.forge/runtime/generations.json`，所有字段和 mailbox 都通过同一个原子串行更新边界保存。Provider 支持 steer 时活动 Turn 输入可立即投递；不支持时消息保持排队，等到 ready 边界或服务重启恢复后再投递。绑定或 Profile 映射变化会标记旧代际替换：活动 Turn 先完成，之后旧 Session stop 并 archive，新代际按需创建。删除仍被引用的自定义 Profile 不会改写资源显式绑定；解析按资源类型默认、再按全局 `default` 回退，同时在 generation 暴露 `agentConfigError` 和实际 `resolvedProfile`。原 Profile 恢复后周期 reconciler 会重新收敛。

Forge 定期从 AgentHub 拉取 Session 状态并以同一 desired-state reconciler 更新本地 run 投影、Profile 解析和全部资源 generation。Task 或 Project 归档会收敛其所有 generation；活动 Turn 默认拒绝 GUI 归档，外部归档也会等待 Turn 自然结束，随后执行 Stop、确认 `stopped`、Archive。未知 Stop/Archive 响应、服务重启和中间状态均由重复 reconcile 恢复。只有观察到 durable `stopped`，或从连续事件历史证明 archived Session 曾进入 `stopped`，才删除对应的瞬态 Forge Session 投影。

Session 投影的创建、AgentHub ID 绑定与安全删除只通过 `internal/app` 的 Server 内部 API 完成。公共 CLI 只保留 `forge session list/show` 作为只读诊断，不提供手工创建、绑定、心跳或结束入口，也不会访问 AgentHub。资源级 Session Lock 已删除；资源聊天由单一当前代际串行化，普通显式 GUI Session 控制仍保留作诊断和兼容用途。

`GET .../turns` 和 `GET .../turns/{turnId}` 代理 AgentHub 的紧凑 Turn 投影；`GET .../events` 另支持稳定 `start`/`end` 有界范围。浏览器先反向读取最新 Turn，只为开放 Turn 补齐原始 Events，再从响应的 `latestEventId` 无缺口接入 SSE；terminal 后用物化 Turn 替换直播区间，thinking/tool 展开时再读取范围 Events。恢复诊断使用独立 `forge.notice`，不伪装成 canonical event。
