<!--- @lang: en-us -->

### Added

- Added a **Delayed Metadata Parsing** option for Local and WebDAV lists. Songs will be added to lists quickly and their titles will temporarily display the filename; song metadata (tags) will be parsed only when needed ([#111](https://github.com/any-listen/any-listen/issues/111)).
- Added a **List Reordering** feature for *My Lists*. When the lists area is focused, hold Ctrl (Command on macOS) to enter list reordering mode, then drag lists to rearrange their order.

### Improved

- Improved song-adding performance for local lists by adopting an **"add-first-then-parse"** strategy, significantly improving the speed of adding songs.

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **延迟解析歌曲信息** 选项，适用于本地列表和 WebDAV 列表。歌曲会被快速添加到列表，名称将暂时显示为文件名；歌曲标签信息将在需要时才进行解析（[#111](https://github.com/any-listen/any-listen/issues/111)）。
- 新增 **我的列表顺序调整** 功能：在列表区域获得焦点时，按住 Ctrl（macOS 上为 Command）即可进入列表位置调整模式，此时拖动列表可调整顺序。

### 优化

- 优化本地列表歌曲添加性能，现在采用 **先添加再解析** 的策略，可以极大提高添加速度。
