# any-listen-desktop change log

All notable changes to this project will be documented in this file.

Project versioning adheres to [Semantic Versioning](http://semver.org/).
Commit convention is based on [Conventional Commits](http://conventionalcommits.org).
Change log format is based on [Keep a Changelog](http://keepachangelog.com/).

## [0.3.0](https://github.com/any-listen/any-listen-desktop/compare/v0.2.0...v0.3.0) - 2025-11-28

### Added

- Added a **Cover Style** option for the Now Playing page under _Settings > Now Playing Page Settings > Cover Style_, offering **CD** and **Square** layouts.
- Added a **Show Status Bar Lyrics** toggle (macOS only) under _Settings > Playback Settings_. Disabled by default.
- Added a **Show Title Bar Lyrics** toggle under _Settings > Playback Settings_. Disabled by default.
- Added a **Show Media Control Bar Lyrics** toggle under _Settings > Playback Settings_. Disabled by default.
- Added **Font Settings** under _Settings > General_.

### Improved

- Improved the insertion position when creating a playlist via an existing playlist so the new list is placed immediately after the target.
- Improved WebDAV data reading logic for better compatibility with more WebDAV services.
- Streamlined WebDAV service list creation so the app prompts for a password and saves it automatically to extension settings.
- Improved the system tray menu experience.

### Fixed

- Fixed update reminders not appearing after the download completes.
- Fixed lingering callbacks not being deregistered when observing local list changes.
- Fixed internal extension logs not refreshing in real time.

---

### 新增

- 新增 **播放详情页封面样式** 选项，位于 _设置 > 播放详情页设置 > 封面样式_，可选择 **CD** 或 **正方形** 样式。
- 新增 **「显示状态栏歌词」** 开关（仅限 macOS 版本），位于 _设置 > 播放设置_，默认关闭。
- 新增 **「显示标题栏歌词」** 开关，位于 _设置 > 播放设置_，默认关闭。
- 新增 **「显示媒体控制栏歌词」** 开关，位于 _设置 > 播放设置_，默认关闭。
- 新增 **「字体设置」**，位于 _设置 > 基本设置_。

### 优化

- 优化通过点击已有列表创建新列表时的插入位置，新列表会立即插入到目标列表之后。
- 优化 WebDAV 数据读取逻辑，改进与更多 WebDAV 服务的兼容性。
- 优化 WebDAV 服务列表创建流程，现在应用会弹窗提示设置密码并自动保存到扩展设置中。
- 优化系统托盘菜单体验。

### 修复

- 修复更新下载完成后更新提醒不再弹出的情况。
- 修复监听本地列表变更时残留回调未被注销的问题。
- 修复内部扩展日志无法实时刷新的问题。

## [0.2.0](https://github.com/any-listen/any-listen-desktop/compare/v0.1.0...v0.2.0) - 2025-09-30

### Added

- Added **"Local List"** creation. You can create a local list via _List right-click menu > New List > Local List_. The local list will automatically update its content according to the songs in the directory created on your device.
- Added **"HTTP Proxy"** option in _Settings > Network Settings_. After setting the proxy server, all traffic will be forwarded to the proxy server.

### Improved

- Improved the display logic of **control buttons** on _MacOS_.
- Improved the process for checking and updating to new versions.
- Optimized the remote list synchronization process. A prompt will now be displayed when synchronization fails.
- Optimized the batch add song sorting mechanism.

### Fixed

- Fixed abnormal issues with the **MacOS installer package**.
- Fixed issues with the process for checking and updating to new versions.

---

### 新增

- 新增 **「本地列表」** 的创建，可通过 _列表右键菜单 > 新建列表 > 本地列表_ 创建，本地列表会自动跟随本机创建的列表歌曲目录内容更新
- 新增 _设置 > 网络设置_ 下的 **「HTTP代理」** 选项，设置代理服务器后所有流量将会被转发到代理服务器

### 优化

- 优化 _MacOS_ 下 **控制按钮** 的显示逻辑
- 优化新版本检查与更新流程
- 优化远程列表同步流程，在同步失败时弹出提示
- 优化批量添加歌曲排序机制

### 修复

- 修复 _MacOS_ 安装包异常的问题
- 修复新版本检查与更新流程

## 0.1.0 - 2025-09-21

First version 🎉
