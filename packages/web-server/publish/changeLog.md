<!--- @lang: en-us -->

### Added

- Added a **Scan Subdirectories** option for the _WebDAV List_, supporting up to five directory levels.
- Added a **Remove Remote Tracks** option for the _WebDAV List_. When enabled, removing a track from the list will also delete the corresponding remote file.
- Added a **Remove Local Tracks** option for the _Local List_. When enabled, removing a track from the list will also delete the corresponding local file.
- Added an **Enable Cache** toggle for _WebDAV Tracks_, disabled by default. You can enable it at _Settings > Extension Settings > WebDAV_.
- Added an **Enable Debug Logs** toggle in the _WebDAV_ extension settings. You can enable it at _Settings > Extension Settings > WebDAV_.
- Added a **Clear Output** button on the _Logs Output_ page to clear the current output logs.
- Added **Resource Cache Management**, available under _Settings > Other Settings_, to view and clear cached resource sizes.
- Added **Song Data Cache Management**, available under _Settings > Other Settings_, to view and clear cached song metadata.
- Added **Disliked Songs Management**, available under _Settings > Other Settings_, to manage songs marked as disliked.

### Improved

- Improved **WebDAV track parsing** performance for faster metadata extraction.
- Optimized **external asset path handling** so the service no longer needs to be deployed at the domain root path ([#95](https://github.com/any-listen/any-listen/issues/95)).
- Improved the update popup's changelog display: it now shows the changelog in the user's selected language; if a translation for that language is not available, it falls back to English.

### Fixed

- Fixed an issue where song scanning failed when the _WebDAV List_ directory was set to empty or `/` while **Include Subdirectories** was selected.
- Fixed an issue where scanning subdirectories in the _WebDAV List_ could fail in certain cases.
- Fixed an issue where songs in the _WebDAV List_ could not be played ([#101](https://github.com/any-listen/any-listen/issues/101)).
- Fixed an issue where album cover links would not refresh after becoming invalid.
- Fixed an issue where the settings dropdown position could be calculated incorrectly.
- Fixed an issue that prevented reading directories on some WebDAV services ([#102](https://github.com/any-listen/any-listen/issues/102)).

### Changed

- By default, _WebDAV Tracks_ are no longer cached. Caching can be enabled manually in the WebDAV extension settings.

---
<!--- @lang: zh-cn -->

### 新增

- 在 _WebDAV 列表_ 中新增 **扫描子目录** 选项，最多支持 5 层目录。
- 在 _WebDAV 列表_ 中新增 **移除远程歌曲** 选项，启用后从列表中移除歌曲时会同步删除对应的远程文件。
- 在 _本地列表_ 中新增 **移除本地歌曲** 选项，启用后从列表中移除歌曲时会同步删除对应的本地文件。
- 在 _WebDAV 歌曲_ 中新增 **启用缓存** 开关（默认关闭）。可在 _设置 > 扩展设置 > WebDAV_ 中手动开启。
- 在 _WebDAV 扩展设置_ 中新增 **启用调试日志** 开关，可在 _设置 > 扩展设置 > WebDAV_ 中开启。
- 在 _日志输出_ 界面新增 **清空输出** 按钮，用于清空当前的输出日志。
- 新增 **资源缓存管理** 功能，位于 _设置 > 其他设置_，可查看并清理已缓存的资源大小。
- 新增 **歌曲数据缓存管理** 功能，位于 _设置 > 其他设置_，可查看并清理已缓存的歌曲元数据。
- 新增 **不喜欢的歌曲管理** 功能，位于 _设置 > 其他设置_，用于管理被标记为“不喜欢”的歌曲。

### 优化

- 优化 **WebDAV 歌曲解析** 性能，加快元数据读取速度。
- 优化 **对外资源路径处理**，服务不再需要部署在域名根路径（[#95](https://github.com/any-listen/any-listen/issues/95)）。
- 优化 **更新弹窗** 中的更新日志显示：现在会根据用户所选语言显示对应语言的更新日志；若未提供该语言的翻译，则回退为英语。

### 修复

- 修复当 _WebDAV 列表_ 目录设置为空或 `/` 且勾选 **包含子目录** 时导致歌曲扫描失败的问题。
- 修复 _WebDAV 列表_ 在某些情况下扫描子目录失败的问题。
- 修复 _WebDAV 列表_ 歌曲无法播放的问题（[#101](https://github.com/any-listen/any-listen/issues/101)）。
- 修复歌曲封面链接失效后未能刷新显示的问题。
- 修复设置界面下拉框位置计算异常的问题。
- 修复在某些 WebDAV 服务上无法读取目录的问题（[#102](https://github.com/any-listen/any-listen/issues/102)）。

### 变更

- 默认不再缓存 _WebDAV 歌曲_，如需缓存可在 WebDAV 扩展设置中手动开启。
