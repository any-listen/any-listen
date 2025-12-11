### Added

- Added a **WebDAV List** option to control whether to scan subdirectories, supporting up to five nested levels.
- Added a **Remove Remote Songs** option for **WebDAV List**. When enabled, removing a song from the list will also delete the corresponding remote file.

### Improved

- Improved **WebDAV Track Parsing** speed for faster _WebDAV_ metadata extraction.

### Fixed

- Fixed the **tray menu** language not updating immediately after switching the app language ([#88](https://github.com/any-listen/any-listen/issues/88)).
- Fixed an issue where song scanning failed when the WebDAV directory list was set to empty or `/` while **Include Subdirectories** was selected.

---

### 新增

- 新增 **WebDAV 列表** 是否扫描子目录选项，支持最多 5 层目录深度。
- 新增 **WebDAV 列表** 是否移除远程歌曲选项，启用后移除列表内歌曲时会同步删除对应远程文件。

### 优化

- 优化 **WebDAV 歌曲解析** 速度，加快 _WebDAV_ 元数据读取。

### 修复

- 修复切换语言时 **托盘菜单** 语言无法立即更新的问题（[#88](https://github.com/any-listen/any-listen/issues/88)）。
- 修复当 WebDAV 列表目录设置为空或 `/` 且勾选 **包含子目录** 时导致歌曲扫描失败的问题。
