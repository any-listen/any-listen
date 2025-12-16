---
agent: edit
---

翻译并格式化更新日志

- 翻译时无需逐字逐句，只需尽量采用目标语言的专业术语和常用表达，符合目标语言的语法和表达习惯
- 内容需使用 markdown 语法编写
- 确保更新日志中同时包含英文和中文版本。如果某条变更项仅有中文或英文，请补充对应的翻译
- 确保中英文日志的描述方式和格式均类似于下方例子。若原始日志未遵循此格式，请调整为类似格式，例如对功能名称加粗、功能路径使用斜体等
- 使用分隔线（---）分隔中英文内容
- 英文日志始终置于文档开头

参考例子1：

```markdown
### Added

- Added a **Cover Style** option for the Now Playing page, located under _Settings > Now Playing Page Settings > Cover Style_, with **CD** and **Square** layouts available.
- Added a **Tray Icon Style** option under _Settings > Tray Settings > Icon Style_, with **White**, **Black**, and **Default Color** styles.
- Added a **Bold Lyrics Font** toggle under _Settings > Now Playing Page Settings_. Enabled by default.
- Added a **Show Status Bar Lyrics** toggle (macOS only) under _Settings > Playback Settings_. Disabled by default.
- Added a **Show Title Bar Lyrics** toggle under _Settings > Playback Settings_. Disabled by default.
- Added **Font Settings** under _Settings > General_.

### Improved

- Improved the update notification mechanism. Detailed error information is now shown when checking for or downloading updates fails ([#59](https://github.com/any-listen/any-listen/issues/59)).
- Improved WebDAV data reading logic for better compatibility with more WebDAV services.
- Streamlined WebDAV service list creation so the app prompts for a password and saves it automatically to extension settings.

### Fixed

- Fixed an issue where ambient sound effects failed to load.
- Fixed lingering callbacks not being deregistered when observing local list changes.

### Changed

- Swapped the positions of **Translated Lyrics** and **Romanized Lyrics**. You can revert to the previous order by enabling the **Swap Translated and Romanized Lyrics Positions** option.

---

### 新增

- 新增 **播放详情页封面样式** 选项，位于 _设置 > 播放详情页设置 > 封面样式_，可选择 **CD** 或 **正方形** 样式。
- 新增 **托盘图标样式** 选项，位于 _设置 > 托盘设置 > 图标样式_，可选择 **白色**、**黑色** 或 **原色** 样式。
- 新增 **「加粗歌词字体」** 开关，位于 _设置 > 播放详情页设置_，默认开启。
- 新增 **「显示状态栏歌词」** 开关（仅限 MacOS 版本），位于 _设置 > 播放设置_，默认关闭。
- 新增 **「显示标题栏歌词」** 开关，位于 _设置 > 播放设置_，默认关闭。
- 新增 **「字体设置」**，位于 _设置 > 基本设置_。

### 优化

- 优化版本更新提示机制，检查或下载失败时将显示详细错误信息（[#59](https://github.com/any-listen/any-listen/issues/59)）。
- 优化 WebDAV 数据读取逻辑，改进与更多 WebDAV 服务的兼容性。
- 优化 WebDAV 服务列表创建流程，现在应用会弹窗提示设置密码并自动保存到扩展设置中。

### 修复

- 修复环境音效加载失败的问题。
- 修复监听本地列表变更时残留回调未被注销的问题。

### 变更

- 调换 **「翻译歌词」** 与 **「罗马音歌词」** 的位置，如需恢复默认之前的行为可启用 **「调换翻译歌词与罗马音歌词位置」** 选项。
```

参考例子2：

```markdown
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
```
