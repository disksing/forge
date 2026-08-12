# Forge Web 服务

`internal/serve` 提供静态 Web UI、Workspace HTTP API，以及 AgentHub Session 的创建、输入、审批、停止、恢复和对账。Workspace 文件操作直接调用 `internal/app`，不会启动 `forge` 子进程。

## 配置与所有权

持久化 GUI 配置使用 schema version 3，包含 Workspace、AgentHub endpoint、Forge instance ID 和 Profile 路由。每个 Workspace 可保存一个内置图标键；缺失或未知值回退为 Forge 默认图标。Settings 的 `User` 页签把用户名保存在当前浏览器的 `localStorage` 中，不进入服务配置或 Workspace 数据。

可用环境变量：

```text
FORGE_AGENTHUB_URL  AgentHub endpoint override
FORGE_GUI_CONFIG    GUI configuration file path
```

每个被管理的 Workspace 同时只能由一个 `forge serve` 进程持有。服务启动时为配置中的每个 Workspace 获取 `<workspace>/.forge/serve.lock` 的 OS advisory 独占锁，并在整个生命周期内保持文件描述符打开。锁冲突会让启动整体失败并释放本轮已取得的锁。

## Workspace 与模板 API

项目、任务、日志、归档、文件预览、Wiki、diff 和模板路由都以显式 Workspace ID 为作用域。结构化模板由 `internal/app` 校验和渲染；`POST .../tasks/preview` 返回最终标题、Markdown 和模板来源/digest，创建时可提交 `expectedTemplateDigest` 防止预览后模板发生变化。

## AgentHub Session

Forge 使用完整 `source.app=forge`、instance ID 和 external ID 创建或恢复 AgentHub Session。浏览器的新 Session 初始消息与后续输入都携带 provenance `role=user` 和当前用户名；该字段只描述来源，不参与认证或授权。

Forge 定期从 AgentHub 拉取 Session 状态并更新本地 run 投影。只有观察到 durable `stopped`，或从连续事件历史证明 archived Session 曾进入 `stopped`，才删除对应的瞬态 Forge Session 投影。AgentHub 不可达或状态未知时保留投影，供后续恢复继续对账。

Session 投影的创建、AgentHub ID 绑定与安全删除只通过 `internal/app` 的 Server 内部 API 完成。公共 CLI 只保留 `forge session list/show` 作为只读诊断，不提供手工创建、绑定、心跳或结束入口，也不会访问 AgentHub。资源级 Session Lock 已删除；同一资源在当前过渡版本中可以拥有多个普通 GUI Session。

`GET .../events` 支持 `after`、`before` 和 limit 游标；SSE 只发送 canonical AgentHub events。恢复诊断使用独立 `forge.notice`，不伪装成 canonical event，也不进入共享 timeline projector。
