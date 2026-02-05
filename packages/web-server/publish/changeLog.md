<!--- @lang: en-us -->

### Added

- Added **Song list sort options**: **File Created Time**, **File Updated Time**, and **File Size**. These sorting options are available in both the _Local List_ and _WebDAV List_.
- Added a **Maximize Window** feature that allows the application interface to be maximized for a larger or full-screen display ([#112](https://github.com/any-listen/any-listen/issues/112), @lswxcs).
- Added a **Delayed Metadata Parsing** option for the local and WebDAV lists. Songs will be added to lists quickly and their titles will temporarily display the filename; song metadata (tags) will be parsed only when needed ([#111](https://github.com/any-listen/any-listen/issues/111)).

### Improved

- Improved window position handling: the app now remembers the window position from the previous session.
- Improved song-adding performance for local lists by adopting a **"add-first-then-parse"** strategy, significantly improving the speed of adding songs.

### Fixed

- Fixed an issue where the **Update Popup** failed to correctly parse historical changelog entries.
- Fixed an issue where the app failed to complete initialization on startup ([#117](https://github.com/any-listen/any-listen/issues/117)).

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **歌曲列表排序方式**：**文件创建时间**、**文件更新时间**、**文件大小**，这些排序方式可在 _本地列表_ 与 _WebDAV 列表_ 使用。
- 新增 **界面最大化** 功能，允许将应用界面最大化以获得更大的或全屏显示（[#112](https://github.com/any-listen/any-listen/issues/112), @lswxcs）。
- 新增 **延迟解析歌曲信息** 选项，适用于本地列表和 WebDAV 列表。歌曲会被快速添加到列表，名称将暂时显示为文件名；歌曲标签信息将在需要时才进行解析（[#111](https://github.com/any-listen/any-listen/issues/111)）。

### 优化

- 优化窗口位置处理：现在会记住上一次打开时的窗口位置。
- 优化本地列表歌曲添加性能，现在采用 **先添加再解析** 的策略，可以极大提高添加速度。

### 修复

- 修复 **更新弹窗** 无法正确解析历史更新日志的问题。
- 修复应用在启动时无法完成初始化的问题（[#117](https://github.com/any-listen/any-listen/issues/117)）。
