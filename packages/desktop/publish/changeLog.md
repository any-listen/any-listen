<!--- @lang: en-us -->

### Added

- Added **Song list sort options**: **File created time**, **File updated time**, and **File size**. These sorting options are available in both the _Local List_ and _WebDAV List_.
- Added **Fullscreen mode**: press F11 to toggle fullscreen, and press ESC to exit fullscreen ([#118](https://github.com/any-listen/any-listen/issues/118)).
- Added a **Delayed Metadata Parsing** option for the local and WebDAV lists. Songs will be added to lists quickly and their titles will temporarily display the filename; song metadata (tags) will be parsed only when needed ([#111](https://github.com/any-listen/any-listen/issues/111)).

### Improved

- Improved song-adding performance for local lists by adopting a **"add-first-then-parse"** strategy, significantly improving the speed of adding songs.

### Fixed

- Fixed an issue where the **Update Popup** failed to correctly parse historical changelog entries.

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **歌曲列表排序方式**：**文件创建时间**、**文件更新时间**、**文件大小**，这些排序方式可在 _本地列表_ 与 _WebDAV 列表_ 使用。
- 新增 **全屏模式**：按 F11 可切换全屏显示，全屏时按 ESC 可退出全屏（[#118](https://github.com/any-listen/any-listen/issues/118)）
- 新增 **延迟解析歌曲信息** 选项，适用于本地列表和 WebDAV 列表。歌曲会被快速添加到列表，名称将暂时显示为文件名；歌曲标签信息将在需要时才进行解析（[#111](https://github.com/any-listen/any-listen/issues/111)）。

### 优化

- 优化本地列表歌曲添加性能，现在采用 **先添加再解析** 的策略，可以极大提高添加速度。

### 修复

- 修复 **更新弹窗** 无法正确解析历史更新日志的问题。
