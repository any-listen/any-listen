### Added

- Added a **Scan Subdirectories** option for the _WebDAV List_, supporting up to 5 directory levels.
- Added a **Remove Remote Songs** option for the _WebDAV List_. When enabled, removing a song from the list will also delete the corresponding remote file.
- Added a **Remove Local Songs** option for the _Local List_. When enabled, removing a song from the list will also delete the corresponding local file.

### Improved

- Improved **WebDAV Track Parsing** speed for faster _WebDAV_ metadata extraction.
- Optimized **external asset path handling** so the service no longer needs to be deployed at the domain root path ([#95](https://github.com/any-listen/any-listen/issues/95)).

### Fixed

- Fixed an issue where song scanning failed when the _WebDAV List_ directory was set to empty or `/` while **Include Subdirectories** was selected.
- Fixed an issue where scanning subdirectories in the _WebDAV List_ could fail in certain cases.
- Fixed an issue where songs in the _WebDAV List_ could not be played ([#101](https://github.com/any-listen/any-listen/issues/101)).

---

### 新增

- 新增 _WebDAV 列表_ 的 **扫描子目录** 选项，支持最多 5 层目录深度。
- 新增 _WebDAV 列表_ 的 **移除远程歌曲** 选项，启用后从列表移除歌曲时会同步删除对应的远程文件。
- 新增 _本地列表_ 的 **移除本地歌曲** 选项，启用后从列表移除歌曲时会同步删除对应的本地文件。

### 优化

- 优化 **WebDAV 歌曲解析** 速度，加快 _WebDAV_ 元数据读取。
- 优化 **对外资源路径处理**，服务不再需要部署在域名根路径（[#95](https://github.com/any-listen/any-listen/issues/95)）。

### 修复

- 修复当 _WebDAV 列表_ 目录设置为空或 `/` 且勾选 **包含子目录** 时导致歌曲扫描失败的问题。
- 修复 _WebDAV 列表_ 在某些情况下扫描子目录失败的问题。
- 修复 _WebDAV 列表_ 歌曲无法播放的问题（[#101](https://github.com/any-listen/any-listen/issues/101)）。
