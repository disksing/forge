# Forge 内部应用 API

`internal/app` 是 CLI 与 `forge serve` 共用的 Workspace 应用层。调用方必须显式提供 Workspace root：

```go
workspace, err := app.OpenWorkspace(root)
if err != nil {
	return err
}

project, err := workspace.CreateProject("Example", "example")
```

`Workspace` 保存规范化后的 root，可安全地在并发请求之间复用。API 不读取进程 cwd，不修改 cwd，不启动 `forge` 子进程，也不向 stdout/stderr 写入协议或用户输出。返回值使用 `Project`、`Task`、`Session`、`WorkspaceTree`、`ResourceDetailView` 等类型；失败时使用 `APIError`，可通过 `errors.As` 或 `app.IsKind` 检查操作类别。

主要入口：

- `OpenWorkspace`、`Initialize`、`Migrate`：打开或初始化显式 Workspace；
- `Tree`、`Resource`、`Projects`、`Tasks`：读取 Workspace 和 AutoRun 视图；
- `Templates`、`Template`、`RenderTemplate`、`ValidateTemplateContent`、`CreateTemplate`、`MigrateTemplates`：统一的模板发现、结构化校验、确定性渲染、脚手架和 V1 迁移；
- `PreviewTask`：无副作用地计算最终标题、Markdown、模板 digest 与 AutoRun 配置；
- `CreateProject`、`CreateTask`、`ArchiveResource`：资源生命周期；
- `CreateSession`、`BindAgentHubSession`、`Heartbeat`、`LockSession`、`UnlockSession`、`EndSession`：session 与资源控制；
- `QueueAutoRun`、`StartAutoRun`、`RetryAutoRun`、`SuspendAutoRun`、`ResumeAutoRun`、`CompleteAutoRun`、`PauseAutoRun`、`FailAutoRun`、`CancelAutoRun`：AutoRun 状态机及其 CAS 控制面；
- `AddLog`、`Logs`、`Repositories`、`CloneRepository` 及 task repository 方法：历史和仓库数据。

跨进程写入使用 Workspace mutation lock；session store 和每个 task 的 AutoRun 更新另外使用既有文件锁。模板任务在同一 mutation lock 中重新读取并渲染；可选 digest 不匹配会在分配任务编号和创建 staging 目录前失败。CLI、HTTP handler 和 GUI 只负责适配输入输出，不解析 YAML 或替换占位符。
