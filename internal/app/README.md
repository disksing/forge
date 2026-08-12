# Forge 内部应用 API

`internal/app` 是 CLI 与 `forge serve` 共用、且唯一实现 Workspace 文件系统业务规则的应用层。已有 root 的服务调用方使用 `OpenWorkspace`；需要从调用者提供的目录寻找所属 Workspace 的 CLI 适配器使用 `OpenWorkspaceFrom`：

```go
workspace, err := app.OpenWorkspace(root)
if err != nil {
	return err
}

project, err := workspace.CreateProject("Example", "example")
```

`Workspace` 保存规范化后的 root，可安全地在并发请求之间复用。API 不读取或修改进程 cwd；`OpenWorkspaceFrom` 的起点同样由调用方显式传入。应用层不启动 `forge` 子进程，也不向 stdout/stderr 写入协议或用户输出。返回值使用 `Project`、`Task`、`Session`、`WorkspaceTree`、`ResourceDetailView` 等类型；失败时使用 `APIError`，可通过 `errors.As` 或 `app.IsKind` 检查操作类别。

主要入口：

- `OpenWorkspace`、`OpenWorkspaceFrom`、`Initialize`、`Migrate`：打开、发现、初始化或迁移 Workspace；
- `NormalizeProjectID`、`NormalizeTaskName`、`NormalizeTaskID`、`InferProjectID`、`InferTaskID`：集中实现 CLI 使用的资源选择规则；
- `Tree`、`Resource`、`Projects`、`Tasks`：读取 Workspace 资源视图；
- `Templates`、`Template`、`RenderTemplate`、`ValidateTemplateContent`、`CreateTemplate`、`MigrateTemplates`：模板发现、结构化校验、确定性渲染、脚手架和 V1 内容迁移；
- `PreviewTask`：无副作用地计算最终标题、Markdown 与模板 digest；
- `CreateProject`、`CreateTask`、`ArchiveResource`：资源生命周期；
- `CreateSession`、`BindAgentHubSession`、`EndSession`：仅供 `forge serve` 使用的瞬态 AgentHub Session 运行投影；
- `Sessions`、`Session`：供 CLI、Server 和 Workspace 视图使用的只读 Session 诊断；
- `AddLog`、`Logs`、`Repositories`、`CloneRepository` 及 Task repository 方法：历史和仓库数据。

跨进程写入使用 Workspace mutation lock。模板任务在同一 mutation lock 中重新读取并渲染；可选 digest 不匹配会在分配任务编号和创建 staging 目录前失败。CLI、HTTP handler 和 GUI 只负责适配输入输出，不解析 YAML、替换占位符或自行读写资源 schema。
