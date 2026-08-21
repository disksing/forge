# PUA macOS 桌面壳

桌面壳使用 Wails v3 和系统 WKWebView 显示 `pua serve` 页面。桌面壳与 PUA
后端是两个独立进程：关闭窗口只隐藏窗口并保留后端；使用 Cmd+Q 时，没有活动 Turn 会优雅停止
App 管理的后端，有活动 Turn 或无法确认活动状态时则让用户选择保留后台、停止并退出或取消。
外部启动的 PUA 永远不会由 App 停止。

首次运行时，随 App 提供的 `Contents/Resources/pua` 会按 SHA-256 安装到：

```text
~/Library/Application Support/PUA/backend/versions/<sha256>/pua
```

`backend/current.json` 指向当前版本，`backend-state.json` 记录由桌面壳启动的后端身份。
用新版 App 替换旧版后再次启动时，桌面壳会比较包内后端和当前受管后端的 SHA-256；如果不同，
它会再次核对 state、serve lock、PID 和 endpoint 的所有权，优雅停止旧进程并启动包内版本。
外部启动的 PUA 不参与这一替换流程。
如果默认 serve config lock 指向一个健康的现有 PUA，桌面壳只连接它，不把外部进程标记为
可管理版本。新的空配置不会把 App 的工作目录误加为 Workspace，用户可以在 Web UI 中添加真实
Workspace。默认地址固定为 `127.0.0.1:4936`，以保持浏览器 origin 和 localStorage 稳定。

同一版本还会原子安装到 `~/.pua/bin/pua`，作为用户和 Agent 共用的稳定 CLI 入口。桌面壳会在
当前用户的 `~/.zprofile`（登录 shell 为 bash 时使用 `~/.bash_profile`）维护一个带明确起止标记的
PATH 区块，并在启动受管后端时立即把 `~/.pua/bin` 前置到其 PATH。因此新 Agent Session 无需等待
用户重新登录即可找到 `pua`；已经打开的终端需要重新打开，或重新加载对应 profile。

在 macOS 上构建本机开发 App：

```bash
scripts/build-desktop
open bin/PUA.app
```

脚本会先构建带完整 Web 资源的 `pua`，再创建 `bin/PUA.app`，并使用 ad-hoc 签名，适合本机
开发验证。它不会生成正式发布包；Developer ID 签名、公证、Universal binary 和 DMG 仍需在
正式桌面发布流程中补充。

开发和隔离测试可使用以下环境变量：

- `PUA_DESKTOP_BACKEND`：指定 bootstrap `pua` 可执行文件；它仍会复制到版本化目录。
- `PUA_DESKTOP_HOME`：覆盖桌面壳 Application Support 目录。
- `PUA_DESKTOP_ADDRESS`：覆盖监听地址，测试时应使用独立端口。
- `PUA_SERVE_CONFIG`：覆盖 PUA serve config，测试时应指向临时目录。
- `PUA_DESKTOP_CLI_PATH`：覆盖稳定 CLI 安装路径，仅供隔离测试。
- `PUA_DESKTOP_SHELL_PROFILE`：覆盖 PATH 托管区块写入的 shell profile，仅供隔离测试。

当前版本只实现独立进程启动、版本化安装、稳定 CLI/PATH、随 App 更新受管 bootstrap、健康检查、重连、外部实例识别和桌面窗口生命周期。
后端升级下载、发布签名校验、活动 Turn 升级策略、失败回滚 UI，以及桌面壳自身升级不在本版范围内。
