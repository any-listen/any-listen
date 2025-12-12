### Added

- Added a **Scan Subdirectories** option for the _WebDAV List_, supporting up to 5 directory levels.
- Added a **Remove Remote Songs** option for the _WebDAV List_. When enabled, removing a song from the list will also delete the corresponding remote file.
- Added a **Remove Local Songs** option for the _Local List_. When enabled, removing a song from the list will also delete the corresponding local file.

### Improved

- Improved **WebDAV Track Parsing** speed for faster _WebDAV_ metadata extraction.

### Fixed

- Fixed the **tray menu** language not updating immediately after switching the app language ([#88](https://github.com/any-listen/any-listen/issues/88)).
- Fixed an issue where song scanning failed when the WebDAV directory list was set to empty or `/` while **Include Subdirectories** was selected.
- Fixed an issue where scanning subdirectories in the _WebDAV List_ could fail in certain cases.

---

### 新增

- 新增 _WebDAV 列表_ 的 **扫描子目录** 选项，支持最多 5 层目录深度。
- 新增 _WebDAV 列表_ 的 **移除远程歌曲** 选项，启用后从列表移除歌曲时会同步删除对应的远程文件。
- 新增 _本地列表_ 的 **移除本地歌曲** 选项，启用后从列表移除歌曲时会同步删除对应的本地文件。

### 优化

- 优化 **WebDAV 歌曲解析** 速度，加快 _WebDAV_ 元数据读取。

### 修复

- 修复切换语言时 **托盘菜单** 语言无法立即更新的问题（[#88](https://github.com/any-listen/any-listen/issues/88)）。
- 修复当 _WebDAV 列表_ 目录设置为空或 `/` 且勾选 **包含子目录** 时导致歌曲扫描失败的问题。
- 修复 _WebDAV 列表_ 在某些情况下扫描子目录失败的问题。
