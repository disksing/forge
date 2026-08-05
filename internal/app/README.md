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
- `CreateProject`、`CreateTask`、`ArchiveResource`：资源生命周期；
- `CreateSession`、`BindAgentHubSession`、`Heartbeat`、`LockSession`、`UnlockSession`、`EndSession`：session 与资源控制；
- `QueueAutoRun`、`StartAutoRun`、`RetryAutoRun`、`ResumeAutoRun`、`CompleteAutoRun`、`WaitAutoRun`、`PauseAutoRun`、`FailAutoRun`：AutoRun 状态机；
- `AddLog`、`Logs`、`Repositories`、`CloneRepository` 及 task repository 方法：历史和仓库数据。

跨进程写入使用 Workspace mutation lock；session store 和每个 task 的 AutoRun 更新另外使用既有文件锁。CLI 只负责参数解析与兼容输出，服务直接使用这些类型化方法。
