<!--- @lang: en-us -->

### Added

- Added a **Track Number** sorting option for song lists ([#152](https://github.com/any-listen/any-listen/issues/152)).
- Added a **Data Sync** feature with support for syncing data to WebDAV, available under _Settings > Data Sync_.
- Added a **Backup & Restore** feature with support for exporting or importing list data locally, and exporting to `txt` and `csv` formats, available under _Settings > Backup & Restore_.
- Added support for local **strm** files. Currently, only song links over HTTP are supported ([#227](https://github.com/any-listen/any-listen/issues/227)).

### Improved

- Improved song cover loading logic and fixed an issue where cover images were not displayed in some cases ([#225](https://github.com/any-listen/any-listen/issues/225)).

### Fixed

- Fixed an issue where moving songs could result in an incorrect saved order in some cases.
- Fixed an issue with lyric timestamp tag parsing.
- Fixed an issue where the **Lyric Offset** feature was not functioning correctly.
- Fixed an issue where the playback speed feature was not functioning correctly.
- Fixed a playlist synchronization issue when playing online lists ([#225](https://github.com/any-listen/any-listen/issues/225)).
- Fixed an issue where the underline in input fields could disappear with certain fonts ([#258](https://github.com/any-listen/any-listen/issues/258)).

---

<!--- @lang: zh-cn -->

### 新增

- 新增歌曲列表排序方式 **「按曲目编号」** 选项（[#152](https://github.com/any-listen/any-listen/issues/152)）。
- 新增 **「数据同步」** 功能，支持将数据同步到 WebDAV，可在 _设置 > 数据同步_ 中使用。
- 新增 **「备份与恢复」** 功能，支持将列表数据导出到或导入本地，并支持导出为 `txt`、`csv` 格式，可在 _设置 > 备份与恢复_ 中使用。
- 新增本地 **「strm」** 类型文件支持，当前仅支持 HTTP 协议的歌曲链接（[#227](https://github.com/any-listen/any-listen/issues/227)）。

### 优化

- 优化歌曲封面加载逻辑，修复某些情况下封面不显示的问题（[#225](https://github.com/any-listen/any-listen/issues/225)）。

### 修复

- 修复在某些情况下移动歌曲时可能导致保存的顺序不对的问题。
- 修复歌词时间标签解析问题。
- 修复歌词偏移功能异常的问题。
- 修复播放速率功能异常的问题。
- 修复播放在线列表时的播放列表同步问题（[#225](https://github.com/any-listen/any-listen/issues/225)）。
- 修复输入框在某些字体下下划线不显示的问题（[#258](https://github.com/any-listen/any-listen/issues/258)）。
