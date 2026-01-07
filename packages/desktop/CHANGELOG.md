# any-listen-desktop change log

All notable changes to this project will be documented in this file.

Project versioning adheres to [Semantic Versioning](http://semver.org/).
Commit convention is based on [Conventional Commits](http://conventionalcommits.org).
Change log format is based on [Keep a Changelog](http://keepachangelog.com/).

## [0.4.1](https://github.com/any-listen/any-listen-desktop/compare/v0.4.0...v0.4.1) - 2026-01-07

<!--- @lang: en-us -->

### Added

- Added an option to control whether deleted files are moved to the **Recycle Bin** when deleting. Enabled by default and configurable under _Settings > Other Settings_ ([#107](https://github.com/any-listen/any-listen/issues/107)).

### Improved

- Added a confirmation dialog before bulk deleting local or remote (WebDAV) song files ([#107](https://github.com/any-listen/any-listen/issues/107)).

### Fixed

- Fixed an issue where files in local or remote lists could be unexpectedly deleted when the **"Sync deletions"** option was enabled during list synchronization ([#107](https://github.com/any-listen/any-listen/issues/107)).

### Changed

- Local lists with the **"Sync removals"** option enabled will now move removed local song files to the Recycle Bin by default ([#107](https://github.com/any-listen/any-listen/issues/107)).

---

<!--- @lang: zh-cn -->

### 新增

- 新增一个用于控制删除时是否将文件移动到 **回收站** 的选项，默认启用，可在 _设置 > 其他设置_ 中更改（[#107](https://github.com/any-listen/any-listen/issues/107)）。

### 优化

- 在批量删除本地或远程（WebDAV）歌曲文件之前新增二次确认弹窗（[#107](https://github.com/any-listen/any-listen/issues/107)）。

### 修复

- 修复在同步列表数据时，启用 **“同步删除”** 选项后，本地列表或远程列表的文件可能被意外删除的问题（[#107](https://github.com/any-listen/any-listen/issues/107)）。

### 变更

- 启用了 **“同步移除歌曲”** 选项的本地列表在移除本地文件时，默认会将其移动到回收站（[#107](https://github.com/any-listen/any-listen/issues/107)）。

## [0.4.0](https://github.com/any-listen/any-listen-desktop/compare/v0.3.0...v0.4.0) - 2026-01-01

<!--- @lang: en-us -->

### Added

- Added a **Scan Subdirectories** option for the _WebDAV List_, supporting up to five directory levels.
- Added a **Remove Remote Songs** option for the _WebDAV List_. When enabled, removing a track from the list will also delete the corresponding remote file.
- Added a **Remove Local Songs** option for the _Local List_. When enabled, removing a track from the list will also delete the corresponding local file.
- Added an **Enable Cache** toggle for _WebDAV Tracks_, disabled by default. You can enable it at _Settings > Extension Settings > WebDAV_.
- Added an **Enable Debug Logs** toggle in the _WebDAV_ extension settings. You can enable it at _Settings > Extension Settings > WebDAV_.
- Added a **Clear Output** button on the _Logs Output_ page to clear the current output logs.
- Added **Resource Cache Management**, available under _Settings > Other Settings_, to view and clear cached resource sizes.
- Added **Song Data Cache Management**, available under _Settings > Other Settings_, to view and clear cached song metadata.
- Added **Disliked Songs Management**, available under _Settings > Other Settings_, to manage songs marked as disliked.

### Improved

- Improved **WebDAV track parsing** performance for faster metadata extraction.
- Improved the **tray icon** behavior: on non-Windows platforms, clicking the tray icon no longer shows the main window ([#103](https://github.com/any-listen/any-listen/issues/103)).
- Improved the update popup's changelog display: it now shows the changelog in the user's selected language; if a translation for that language is not available, it falls back to English.

### Fixed

- Fixed the **tray menu** language not updating immediately after switching the app language ([#88](https://github.com/any-listen/any-listen/issues/88)).
- Fixed an issue where scanning for songs could fail when the _WebDAV List_ directory was empty or set to `/` while **Include Subdirectories** was selected.
- Fixed an issue where scanning subdirectories in the _WebDAV List_ could fail in certain cases.
- Fixed an issue where album cover links would not refresh after becoming invalid.
- Fixed an issue where the settings dropdown position could be calculated incorrectly.
- Fixed an issue that prevented reading directories on some WebDAV services ([#102](https://github.com/any-listen/any-listen/issues/102)).

### Changed

- By default, _WebDAV Tracks_ are no longer cached. Caching can be enabled manually in the WebDAV extension settings.

---
<!--- @lang: zh-cn -->

### 新增

- 在 _WebDAV 列表_ 中新增 **扫描子目录** 选项，最多支持 5 层目录。
- 在 _WebDAV 列表_ 中新增 **移除远程歌曲** 选项，启用后从列表中移除歌曲时会同时删除对应的远程文件。
- 在 _本地列表_ 中新增 **移除本地歌曲** 选项，启用后从列表中移除歌曲时会同时删除对应的本地文件。
- 在 _WebDAV 歌曲_ 中新增 **启用缓存** 开关（默认关闭）。可在 _设置 > 扩展设置 > WebDAV_ 中手动开启。
- 在 _WebDAV 扩展设置_ 中新增 **启用调试日志** 开关，可在 _设置 > 扩展设置 > WebDAV_ 中开启。
- 在 _日志输出_ 界面新增 **清空输出** 按钮，用于清空当前的输出日志。
- 新增 **资源缓存管理** 功能，位于 _设置 > 其他设置_，可查看并清理已缓存的资源大小。
- 新增 **歌曲数据缓存管理** 功能，位于 _设置 > 其他设置_，可查看并清理已缓存的歌曲元数据。
- 新增 **不喜欢的歌曲管理** 功能，位于 _设置 > 其他设置_，用于管理被标记为“不喜欢”的歌曲。

### 优化

- 优化 **WebDAV 歌曲解析** 性能，加快元数据读取速度。
- 优化 **托盘图标** 行为：在非 Windows 系统中，点击托盘图标时不再显示主窗口（[#103](https://github.com/any-listen/any-listen/issues/103)）。
- 优化 **更新弹窗** 中的更新日志显示：现在会根据用户所选语言显示对应语言的更新日志；若未提供该语言的翻译，则回退为英语。

### 修复

- 修复切换语言后 **托盘菜单** 语言无法立即更新的问题（[#88](https://github.com/any-listen/any-listen/issues/88)）。
- 修复当 _WebDAV 列表_ 目录为空或设置为 `/` 且勾选 **包含子目录** 时导致歌曲扫描失败的问题。
- 修复 _WebDAV 列表_ 在某些情况下扫描子目录失败的问题。
- 修复歌曲封面链接失效后未能刷新显示的问题。
- 修复设置界面下拉框位置计算异常的问题。
- 修复在某些 WebDAV 服务上无法读取目录的问题（[#102](https://github.com/any-listen/any-listen/issues/102)）。

### 变更

- 默认不再缓存 _WebDAV 歌曲_，如需缓存可在 WebDAV 扩展设置中手动开启。

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
