<!--- @lang: en-us -->

### Added

- Added **Song list sort options**: **File Created Time**, **File Updated Time**, and **File Size**. These sorting options are available in both the _Local List_ and _WebDAV List_.
- Added a **Maximize Window** feature that lets the application interface be maximized for larger or full‑screen display ([#112](https://github.com/any-listen/any-listen/issues/112), @lswxcs).
- Added a **Delayed Metadata Parsing** option for Local and WebDAV lists. Songs are added to lists quickly and their titles temporarily display the filename; metadata (tags) will be parsed on demand ([#111](https://github.com/any-listen/any-listen/issues/111)).
- Added a **List Reordering** feature for *My Lists*. When the lists area is focused, hold Ctrl (Command on macOS) to enter list reordering mode, then drag lists to rearrange their order.

### Improved

- Improved window position handling: the app now remembers the window position from the previous session.
- Improved song-adding performance for local lists by adopting an **"add-first-then-parse"** strategy, significantly improving the speed of adding songs.
- Improved the cover art display on the **Now Playing** page ([#122](https://github.com/any-listen/any-listen/issues/122)).

### Fixed

- Fixed an issue where the **Update Popup** failed to correctly parse historical changelog entries.
- Fixed an issue where the app failed to complete initialization on startup ([#117](https://github.com/any-listen/any-listen/issues/117)).
- Fixed incorrect storage of playback history in _Shuffle_ playback mode.

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **歌曲列表排序方式**：**文件创建时间**、**文件更新时间**、**文件大小**，适用于 _本地列表_ 与 _WebDAV 列表_。
- 新增 **界面最大化** 功能，允许将应用界面最大化以获得更大或全屏显示（[#112](https://github.com/any-listen/any-listen/issues/112), @lswxcs）。
- 新增 **延迟解析歌曲信息** 选项（适用于本地列表与 WebDAV 列表）。歌曲将被快速加入列表，暂以文件名显示；标签元数据将在需要时按需解析（[#111](https://github.com/any-listen/any-listen/issues/111)）。
- 新增 **我的列表顺序调整** 功能：在列表区域获得焦点时，按住 Ctrl（macOS 上为 Command）进入列表重排模式，然后拖动列表以调整顺序。

### 优化

- 优化窗口位置处理，应用现在会记住上一次的窗口位置。
- 优化本地列表歌曲添加性能，采用 **先添加再解析** 的策略，大幅提升添加速度。
- 优化 **播放详情页** 的封面显示（[#122](https://github.com/any-listen/any-listen/issues/122)）。

### 修复

- 修复 **更新弹窗** 无法正确解析历史更新日志的问题。
- 修复应用在启动时无法完成初始化的问题（[#117](https://github.com/any-listen/any-listen/issues/117)）。
- 修复在 _随机播放_ 模式下播放记录存储不正确的问题。
