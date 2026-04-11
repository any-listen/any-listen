<!--- @lang: en-us -->

### Added

- Added the **“Taoism”** theme. When enabled, the application will switch between your previously selected light‑color theme and the **“Blackout”** theme according to the system’s light/dark mode. ([#136](https://github.com/any-listen/any-listen/issues/136))
- Added a **“Use Polling to Watch for File Changes”** option in _Local List Settings_ to address issues reading from mounted remote drives ([#142](https://github.com/any-listen/any-listen/issues/142)).
- Added preliminary **cover display** in the *playlist list* (no custom covers yet; uses the cover from the first song in the list) and **song count** shown in playlists.

### Improved

- Improved sorting of search results within playlists.
- Improved the extension management system. Bubble notifications now appear when extensions fail to load or when updates are available.

### Fixed

- Fixed an issue where artist tag information in `wav` files was parsed as garbled text ([#132](https://github.com/any-listen/any-listen/issues/132)).
- Fixed an issue where a **WebDAV list** could only add up to 1 000 songs ([#134](https://github.com/any-listen/any-listen/issues/134)).
- Fixed playback or file‑reading failures caused by **file extension case sensitivity** ([#141](https://github.com/any-listen/any-listen/issues/141)).
- Fixed **WebDAV metadata** read errors.
- Fixed a conflict between playback cover and playlist song cover loading logic.
- Fixed an issue where song information in the **Playback History** list didn't update when the song in the original list was changed.
- Fixed an issue where the **“Resume playback position on launch”** setting did not take effect ([#150](https://github.com/any-listen/any-listen/issues/150)).

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **“道法自然”主题**。勾选该主题时，应用会根据当前系统的亮/暗模式，在之前选定的亮色主题与 **“黑灯瞎火”** 主题之间切换。([#136](https://github.com/any-listen/any-listen/issues/136))
- 本地列表设置新增 **“使用轮询监听文件变动”** 选项，用于解决挂载的远程驱动器读取问题 ([#142](https://github.com/any-listen/any-listen/issues/142))。
- 在 **歌单列表** 中初步添加 **封面显示**（暂不支持自定义封面，自动取列表内第一首歌的封面作为歌单封面）与 **歌曲数量** 显示。

### 优化

- 优化歌单内歌曲搜索结果排序。
- 完善扩展管理系统，现在扩展加载失败或者有新版本时会有气泡提示。

### 修复

- 修复 `wav` 文件的艺术家标签信息解析为乱码的问题（[#132](https://github.com/any-listen/any-listen/issues/132)）。
- 修复 **WebDAV 列表** 最多只能添加 1000 首歌曲的问题（[#134](https://github.com/any-listen/any-listen/issues/134)）。
- 修复由于 **文件扩展名大小写敏感** 导致的播放或文件读取失败的问题（[#141](https://github.com/any-listen/any-listen/issues/141)）。
- 修复 **WebDAV 元数据** 读取错误。
- 修复播放封面与列表内歌曲封面加载逻辑冲突的问题。
- 修复**播放历史列表**中的歌曲信息在原始列表歌曲更新时未随之更新的问题。
- 修复 **“启动软件时是否恢复上次播放进度”** 设置不生效的问题（[#150](https://github.com/any-listen/any-listen/issues/150)）。
