<!--- @lang: en-us -->

### Added

- Added a **Delayed Metadata Parsing** option for the local and WebDAV lists. Songs will be added to lists quickly and their titles will temporarily display the filename; song metadata (tags) will be parsed only when needed ([#111](https://github.com/any-listen/any-listen/issues/111)).

### Improved

- Improved song-adding performance for local lists by adopting a **"add-first-then-parse"** strategy, significantly improving the speed of adding songs.

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **延迟解析歌曲信息** 选项，适用于本地列表和 WebDAV 列表。歌曲会被快速添加到列表，名称将暂时显示为文件名；歌曲标签信息将在需要时才进行解析（[#111](https://github.com/any-listen/any-listen/issues/111)）。


### 优化

- 优化本地列表歌曲添加性能，现在采用 **先添加再解析** 的策略，可以极大提高添加速度。
