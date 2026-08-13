# Generation 生命周期规划边界

`generation_lifecycle.go` 定义单个稳定 resource 的 canonical facts、lifecycle intent、phase、operation receipt 和纯 planner。它不读文件、不读取时钟、不访问 AgentHub，也不持有 controller 或 store 锁。

## 事实与阶段

一次规划输入由 Workspace instance ID、稳定 resource ID、current generation ID、解析后的 Agent binding、AgentHub Session/Turn/approval 观察、mailbox 下一条待办、idle deadline 是否到期、资源归档事实和 lifecycle receipt 组成。`Phase` 只使用 `absent`、`creating`、`ready`、`active`、`stopping`、`stopped`、`archived`、`recovering`；AgentHub 的 `running` 与 `waiting_approval` 都映射为 `active`。

`Intent` 只有 `none`、`idle`、`replacement`、`archive`、`recovery`。资源归档优先于其他 intent，binding 变化优先于 idle。ready 边界只有在没有活动 Turn/approval、没有待处理 mailbox、没有 lifecycle 收敛工作且 deadline 已到期时才能创建 idle Stop intent。

## Operation 优先级

同一份 facts 始终生成同一份 plan，并且每份 plan 只有一个下一步 operation：

1. 归档资源先把 queued/delivering/interrupting mailbox 项收敛为 `undeliverable` 或 `delivery_unknown`，不向归档资源继续投递。
2. archive、replacement、idle、recovery intent 统一执行 `WaitForTurnTerminal → StopSession → WaitForStopped → ArchiveSession → RetireGeneration`。活动 Turn 或 approval 只等待自然 terminal，不被 idle/资源归档静默中断。
3. delivering/interrupting 项先执行 `WaitForMessageReceipt`；稳定 message ID 的结果未知时不能改发另一条消息。
4. active Turn 中，interrupt 规划 `InterruptTurn`；支持 steer 时规划 `DeliverMessage`；enqueue 等待 Turn terminal。ready Session 才能 delivery。
5. 没有 current generation 且 mailbox 有待办时规划 `CreateGeneration`；资源已归档时永不创建。
6. idle deadline 只在 proven ready boundary 规划 `StopSession`。

`CreateGeneration`、`DeliverMessage`、`InterruptTurn`、`StopSession`、`ArchiveSession` 和 `ObserveSession` 是网络 effect；`RetireGeneration` 与 mailbox finalize 是本地 store effect；`Wait*` 和 `none` 不产生 effect。

## 执行与恢复

执行边界固定为：

```text
facts → PlanGeneration → durable receipt → network/store effect
      → re-read facts → LifecycleGuardMatchesFacts/GuardedLifecycleCommit
      → replan
```

`GenerationLifecycleGuard` 至少绑定 Workspace instance、resource、generation、Session、Turn、message 和 store revision。网络返回后必须重新读取这些身份；guard 不匹配时丢弃结果，不得让旧 generation 退休新 generation。Stop/Archive 由同一稳定 operation ID 重试，Session 已经处于目标 terminal state 时按幂等成功处理；请求结果未知先保留 receipt 并等待观察，不把未知误判为失败或成功。

`GenerationLifecycleEffects` 只描述 effect adapter，明确禁止在 callback 内持有 store/controller 锁。它返回的 Session 观察不是提交结果，调用方必须重新读取 facts 并 guarded commit。Server 重启后，store adapter 从 receipt、Session observation 和 mailbox receipt 重建同一 plan；等待边界不会因为重启重置 idle deadline。

## 兼容与回滚

`AdaptLegacyGenerationFacts` 和 `ApplyLegacyLifecyclePlan` 是当前 `generations.json`/旧 mailbox projection 的唯一兼容边界。旧的 `ReplacementPending`、`IdleSleepStopRequested`、`ArchivedTaskStopRequested`、`AgentHubStoppedObserved` 以及进程内 stop flag 只在 adapter 中映射；planner 不认识这些字段。task320 generation store 完成后，应由其 Store adapter 提供同样的 canonical facts/receipt，不把一次性迁移放回 status/send/reconcile 热路径。

回滚代码时不得删除已写入的新 receipt 或 retired manifest；停止新版本写入后再由兼容 adapter 读取。若旧代码无法理解新 receipt，应先保留 mailbox/generation 数据并暂停 lifecycle 写入，不能用旧版本覆盖新版本的 current/retired 事实。

