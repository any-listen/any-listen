### Added

- Added a **WebDAV List** option to control whether to scan subdirectories, supporting up to five nested levels.
- Added a **Remove Remote Songs** option for **WebDAV List**. When enabled, removing a song from the list will also delete the corresponding remote file.

### Improved

- Improved **WebDAV Track Parsing** speed for faster _WebDAV_ metadata extraction.
- Optimized **external asset path handling** so the service no longer has to be deployed at the domain root path ([#95](https://github.com/any-listen/any-listen/issues/95)).

### Fixed

- Fixed an issue where song scanning failed when the WebDAV directory list was set to empty or `/` while **Include Subdirectories** was selected.

---

### 新增

- 新增 **WebDAV 列表** 是否扫描子目录选项，支持最多 5 层目录深度。
- 新增 **WebDAV 列表** 是否移除远程歌曲选项，启用后移除列表内歌曲时会同步删除对应远程文件。

### 优化

- 优化 **WebDAV 歌曲解析** 速度，加快 _WebDAV_ 元数据读取。
- 优化 **对外资源路径处理**，服务不再需要部署在域名根路径（[#95](https://github.com/any-listen/any-listen/issues/95)）。

### 修复

- 修复当 WebDAV 列表目录设置为空或 `/` 且勾选 **包含子目录** 时导致歌曲扫描失败的问题。
