# PUA macOS 桌面壳

桌面壳使用 Wails v3 和系统 WKWebView 显示 `pua serve` 页面。桌面壳与 PUA
后端是两个独立进程：关闭窗口或使用 Cmd+Q 退出桌面壳不会终止后端，重新打开桌面壳时会通过
serve lock 和桌面状态文件重连。这样后续可以在不替换桌面壳的前提下，为后端实现下载、校验、
切换和回滚。

首次运行时，随 App 提供的 `Contents/Resources/pua` 会按 SHA-256 安装到：

```text
~/Library/Application Support/PUA/backend/versions/<sha256>/pua
```

`backend/current.json` 指向当前版本，`backend-state.json` 记录由桌面壳启动的后端身份。
如果默认 serve config lock 指向一个健康的现有 PUA，桌面壳只连接它，不把外部进程标记为
可管理版本。新的空配置不会把 App 的工作目录误加为 Workspace，用户可以在 Web UI 中添加真实
Workspace。默认地址固定为 `127.0.0.1:4936`，以保持浏览器 origin 和 localStorage 稳定。

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

当前版本只实现独立进程启动、版本化安装、健康检查、重连、外部实例识别和桌面窗口生命周期。
后端升级下载、发布签名校验、活动 Turn 升级策略、失败回滚 UI，以及桌面壳自身升级不在本版范围内。
