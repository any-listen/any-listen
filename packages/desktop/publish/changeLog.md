<!--- @lang: en-us -->

### Added

- Added **Song list sort options**: **File Created Time**, **File Updated Time**, and **File Size**. These sorting options are available in both the _Local List_ and _WebDAV List_.
- Added **Fullscreen Mode**: Press F11 to toggle fullscreen; press Esc to exit fullscreen ([#118](https://github.com/any-listen/any-listen/issues/118)).
- Added a **Delayed Metadata Parsing** option for _Local_ and _WebDAV_ lists. Songs are added to lists quickly and their titles temporarily display the filename; metadata (tags) are parsed on demand ([#111](https://github.com/any-listen/any-listen/issues/111)).
- Added **List Reordering** for _My Lists_. When the lists area is focused, hold Ctrl (Command on macOS) to enter reordering mode, then drag lists to rearrange their order.

### Improved

- Improved local list song-adding performance by adopting an **"add-first-then-parse"** strategy, significantly speeding up list population.
- Improved the **Now Playing** page cover display ([#122](https://github.com/any-listen/any-listen/issues/122)).

### Fixed

- Fixed an issue where the **Update Popup** failed to correctly parse historical changelog entries.
- Fixed incorrect playback history when playing songs queued as **Play Later**.
- Fixed incorrect storage of playback history in _Shuffle_ playback mode.
- Fixed an issue where local songs with identical filenames could display incorrect cover art ([#125](https://github.com/any-listen/any-listen/issues/125)).

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **歌曲列表排序方式**：**文件创建时间**、**文件更新时间**、**文件大小**。这些排序方式可在 _本地列表_ 与 _WebDAV 列表_ 使用。
- 新增 **全屏模式**：按 F11 可切换全屏，按 Esc 可退出全屏（[#118](https://github.com/any-listen/any-listen/issues/118)）。
- 新增 **延迟解析歌曲信息** 选项，适用于 _本地列表_ 与 _WebDAV 列表_。歌曲会被快速添加到列表，名称将暂时显示为文件名；歌曲标签信息将在需要时才解析（[#111](https://github.com/any-listen/any-listen/issues/111)）。
- 新增 **我的列表顺序调整** 功能：在列表区域获得焦点时，按住 Ctrl（macOS 上为 Command）即可进入顺序调整模式，拖动列表以调整顺序。

### 优化

- 优化本地列表歌曲添加性能，采用 **“先添加再解析”** 策略，显著提升添加速度。
- 优化 **播放详情页** 封面显示（[#122](https://github.com/any-listen/any-listen/issues/122)）。

### 修复

- 修复 **更新弹窗** 无法正确解析历史更新日志的问题。
- 修复在播放 **稍后播放** 队列中的歌曲时，播放历史记录不正确的问题。
- 修复在 _随机播放_ 模式下播放记录存储不正确的问题。
- 修复了同名本地歌曲可能显示错误封面的问题（[#125](https://github.com/any-listen/any-listen/issues/125)）。
