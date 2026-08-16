# Generation Store

Generation store 是 Workspace 内唯一的 generation 持久化边界。调用方只提交带稳定 `resourceId`、`generationId` 和 JSON payload 的 `Record`，不直接读写文件。

布局如下：

```text
<control-dir>/runtime/generation-store.json
<control-dir>/runtime/resources/<resource-key>/current.json
<control-dir>/runtime/resources/<resource-key>/generations/<generation-key>.json
<control-dir>/runtime/resources/<resource-key>/legacy/<record-key>.json
```

`current.json` 是资源唯一的可变记录；退役 manifest 写入后不可修改，生命周期 reconcile 只能读取 current。`ResourceKey` 分别编码 Workspace instance ID 和资源 ID，因此不依赖本地路径，也不会把分隔符解释成路径层级。

`<control-dir>` 对新 Workspace 是 `.pua`；已有 `.forge` Workspace 在显式重命名前继续原地使用。首次访问会把 v1 `<control-dir>/runtime/generations.json` 和 `<control-dir>/gui-agent/runs.json` 写入固定 staging 目录，再逐资源原子切换到 v2 文件，文件与目录均执行 fsync，最后把 marker 从 `migrating` 切换为 `ready`。旧文件不删除，缺少 `generationId` 的记录写入 `legacy/`，只用于历史和诊断。marker 处于 `migrating` 时重复启动会丢弃未完成 staging 并从未变更的旧输入重建，因此崩溃点可重试；marker 为 `ready` 后不再读取旧输入。

Serve 的 current、retired、cold history 和 CLI/application diagnostics 都通过 `Store` API 访问。Store 锁只覆盖一次迁移或一个 resource key 的本地文件事务，不在锁内访问 AgentHub 或其他网络服务。
