<!--- @lang: en-us -->

### Added

- Added a **Track Number** sorting option for song lists ([#152](https://github.com/any-listen/any-listen/issues/152)).
- Added a **Data Sync** feature with support for syncing data to WebDAV, available under _Settings > Data Sync_.
- Added a **Backup & Restore** feature with support for exporting or importing list data locally, and exporting to `txt` and `csv` formats, available under _Settings > Backup & Restore_.
- Added support for local **strm** files. Currently, only song links over HTTP are supported ([#227](https://github.com/any-listen/any-listen/issues/227)).
- Added **Classic Lyrics** mode for Desktop Lyrics.
- Added **Desktop Lyrics** controls to the **Tray Menu**.
- Added a **Record debug logs** option for WebDAV data synchronization.
- Added logging output views for the app and extension service.

### Improved

- Improved song cover loading logic and fixed an issue where cover images were not displayed in some cases ([#225](https://github.com/any-listen/any-listen/issues/225)).
- Added initial support for scheduled auto-sync for **Remote Lists** and **Online Lists**. It is currently fixed to run once daily at 11:00 AM ([#264](https://github.com/any-listen/any-listen/issues/264)).
- Improved the automatic source-switching matching logic.

### Fixed

- Fixed an issue where moving songs could result in an incorrect saved order in some cases.
- Fixed an issue with lyric timestamp tag parsing.
- Fixed an issue where the **Lyric Offset** feature was not functioning correctly.
- Fixed an issue where the playback speed feature was not functioning correctly.
- Fixed a playlist synchronization issue when playing online lists ([#225](https://github.com/any-listen/any-listen/issues/225)).
- Fixed an issue where full-screen window state on macOS might not sync correctly ([#257](https://github.com/any-listen/any-listen/issues/257)).
- Fixed an issue where the progress bar could display incorrectly when updating media control bar information on macOS ([#256](https://github.com/any-listen/any-listen/issues/256)).
- Fixed an issue where the underline in input fields could disappear with certain fonts ([#258](https://github.com/any-listen/any-listen/issues/258)).
- Fixed an issue where the window size did not restore after exiting fullscreen in Windows non-transparent mode ([#261](https://github.com/any-listen/any-listen/issues/261)).
- Fixed an issue where the proxy service threw errors when proxying certain resources ([#263](https://github.com/any-listen/any-listen/issues/263)).

### Changed

- Desktop Lyrics now defaults to **Classic Lyrics** mode. To switch back to the previous multi-line mode, go to _Settings > Desktop Lyrics Settings > Lyrics Mode_.

---

<!--- @lang: zh-cn -->

### 新增

- 新增歌曲列表排序方式 **「按曲目编号」** 选项（[#152](https://github.com/any-listen/any-listen/issues/152)）。
- 新增 **「数据同步」** 功能，支持将数据同步到 WebDAV，可在 _设置 > 数据同步_ 中使用。
- 新增 **「备份与恢复」** 功能，支持将列表数据导出到或导入本地，并支持导出为 `txt`、`csv` 格式，可在 _设置 > 备份与恢复_ 中使用。
- 新增本地 **「strm」** 类型文件支持，当前仅支持 HTTP 协议的歌曲链接（[#227](https://github.com/any-listen/any-listen/issues/227)）。
- 桌面歌词新增 **「经典歌词」** 模式。
- 在 **「托盘菜单」** 中新增 **「桌面歌词」** 相关控制。
- 新增 WebDAV 数据同步的 **「记录调试日志」** 选项。
- 新增 APP、扩展服务 等日志输出界面。

### 优化

- 优化歌曲封面加载逻辑，修复某些情况下封面不显示的问题（[#225](https://github.com/any-listen/any-listen/issues/225)）。
- 初步新增 **「远程列表」** 与 **「在线列表」** 的定时自动同步功能，当前固定为每天上午 11 点同步一次（[#264](https://github.com/any-listen/any-listen/issues/264)）。
- 优化自动换源匹配机制。

### 修复

- 修复在某些情况下移动歌曲时可能导致保存的顺序不对的问题。
- 修复歌词时间标签解析问题。
- 修复歌词偏移功能异常的问题。
- 修复播放速率功能异常的问题。
- 修复播放在线列表时的播放列表同步问题（[#225](https://github.com/any-listen/any-listen/issues/225)）。
- 修复 macOS 全屏窗口状态可能不同步的问题（[#257](https://github.com/any-listen/any-listen/issues/257)）。
- 修复 macOS 更新媒体控制栏信息时的进度条显示问题（[#256](https://github.com/any-listen/any-listen/issues/256)）
- 修复输入框在某些字体下下划线不显示的问题（[#258](https://github.com/any-listen/any-listen/issues/258)）。
- 修复 Windows 非透明模式下退出全屏时窗口大小未恢复的问题（[#261](https://github.com/any-listen/any-listen/issues/261)）。
- 修复代理服务在代理某些资源时报错的问题（[#263](https://github.com/any-listen/any-listen/issues/263)）。

### 变更

- 桌面歌词默认使用 **「经典歌词」** 模式，如需切换回原来的多行模式，可前往 _设置 > 桌面歌词设置 > 歌词模式_ 进行切换。
