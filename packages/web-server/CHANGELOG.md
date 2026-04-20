# any-listen-web-server change log

All notable changes to this project will be documented in this file.

Project versioning adheres to [Semantic Versioning](http://semver.org/).
Commit convention is based on [Conventional Commits](http://conventionalcommits.org).
Change log format is based on [Keep a Changelog](http://keepachangelog.com/).

## [0.8.0](https://github.com/any-listen/any-listen-web-server/compare/v0.7.0...v0.8.0) - 2026-04-20

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
- Fixed an issue where some form fields remained editable via keyboard when disabled.

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
- 修复某些表单项在禁用状态仍可通过键盘编辑的问题。

## [0.7.0](https://github.com/any-listen/any-listen-web-server/compare/v0.6.1...v0.7.0) - 2026-02-16

<!--- @lang: en-us -->

Happy New Year! Let's keep working hard in the days ahead.

### Added

- Added **Song list sort options**: **File Created Time**, **File Updated Time**, and **File Size**. These sorting options are available in both the _Local List_ and _WebDAV List_.
- Added a **Maximize Window** feature that lets the application interface be maximized for larger or full‑screen display ([#112](https://github.com/any-listen/any-listen/issues/112), @lswxcs).
- Added a **Delayed Metadata Parsing** option for Local and WebDAV lists. Songs are added to lists quickly and their titles temporarily display the filename; metadata (tags) will be parsed on demand ([#111](https://github.com/any-listen/any-listen/issues/111)).
- Added a **List Reordering** feature for _My Lists_. When the lists area is focused, hold Ctrl (Command on macOS) to enter list reordering mode, then drag lists to rearrange their order.
- Added a **Pause on Output Device Change** option under _Settings > Playback Settings_. Disabled by default.

### Improved

- Improved window position handling: the app now remembers the window position from the previous session.
- Improved song-adding performance for local lists by adopting an **"add-first-then-parse"** strategy, significantly improving the speed of adding songs.
- Improved the cover art display on the **Now Playing** page ([#122](https://github.com/any-listen/any-listen/issues/122)).
- Improved the tooltip display for the **control buttons** ([#127](https://github.com/any-listen/any-listen/issues/127)).

### Fixed

- Fixed an issue where the **Update Popup** failed to correctly parse historical changelog entries.
- Fixed an issue where the app failed to complete initialization on startup ([#117](https://github.com/any-listen/any-listen/issues/117)).
- Fixed incorrect playback history when playing songs queued as **Play Later**.
- Fixed incorrect storage of playback history in _Shuffle_ playback mode.
- Fixed an issue where local songs with identical filenames could display incorrect cover art ([#125](https://github.com/any-listen/any-listen/issues/125)).
- Fixed an issue where the playback queue was not managed correctly when playing songs from the **Play Later** queue ([#131](https://github.com/any-listen/any-listen/issues/131)).

---

<!--- @lang: zh-cn -->

大家新年快乐，让我们在接下来的日子里继续努力~！

### 新增

- 新增 **歌曲列表排序方式**：**文件创建时间**、**文件更新时间**、**文件大小**，适用于 _本地列表_ 与 _WebDAV 列表_。
- 新增 **界面最大化** 功能，允许将应用界面最大化以获得更大或全屏显示（[#112](https://github.com/any-listen/any-listen/issues/112), @lswxcs）。
- 新增 **延迟解析歌曲信息** 选项（适用于本地列表与 WebDAV 列表）。歌曲将被快速加入列表，暂以文件名显示；标签元数据将在需要时按需解析（[#111](https://github.com/any-listen/any-listen/issues/111)）。
- 新增 **我的列表顺序调整** 功能：在列表区域获得焦点时，按住 Ctrl（macOS 上为 Command）进入列表重排模式，然后拖动列表以调整顺序。
- 新增 **输出设备改变时暂停播放** 选项，位于 _设置 > 播放设置_，默认关闭。

### 优化

- 优化窗口位置处理，应用现在会记住上一次的窗口位置。
- 优化本地列表歌曲添加性能，采用 **先添加再解析** 的策略，大幅提升添加速度。
- 优化 **播放详情页** 的封面显示（[#122](https://github.com/any-listen/any-listen/issues/122)）。
- 优化 **控制按钮** 的工具提示文本显示效果（[#127](https://github.com/any-listen/any-listen/issues/127)）。

### 修复

- 修复 **更新弹窗** 无法正确解析历史更新日志的问题。
- 修复应用在启动时无法完成初始化的问题（[#117](https://github.com/any-listen/any-listen/issues/117)）。
- 修复在播放 **稍后播放** 队列中的歌曲时，播放历史记录不正确的问题。
- 修复在 _随机播放_ 模式下播放记录存储不正确的问题。
- 修复了同名本地歌曲可能显示错误封面的问题（[#125](https://github.com/any-listen/any-listen/issues/125)）。
- 修复在播放 **稍后播放** 队列中的歌曲时，播放队列管理不正确的问题（[#131](https://github.com/any-listen/any-listen/issues/131)）。

## [0.6.1](https://github.com/any-listen/any-listen-web-server/compare/v0.6.0...v0.6.1) - 2026-01-07

<!--- @lang: en-us -->

### Fixed

- Fixed an issue where files in local or remote lists could be unexpectedly deleted when the **"Sync deletions"** option was enabled during list synchronization ([#107](https://github.com/any-listen/any-listen/issues/107)).

### Improved

- Added a confirmation dialog before bulk deleting local or remote (WebDAV) song files ([#107](https://github.com/any-listen/any-listen/issues/107)).

---

<!--- @lang: zh-cn -->

### 修复

- 修复在同步列表数据时，启用 **“同步删除”** 选项后，本地列表或远程列表的文件可能被意外删除的问题（[#107](https://github.com/any-listen/any-listen/issues/107)）。

### 优化

- 在批量删除本地或远程（WebDAV）歌曲文件之前新增二次确认弹窗（[#107](https://github.com/any-listen/any-listen/issues/107)）。

## [0.6.0](https://github.com/any-listen/any-listen-web-server/compare/v0.5.0...v0.6.0) - 2026-01-01

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

## [0.5.0](https://github.com/any-listen/any-listen-web-server/compare/v0.4.0...v0.5.0) - 2025-11-28

### Added

- Added a **Cover Style** option for the Now Playing page under _Settings > Now Playing Page Settings > Cover Style_, offering **CD** and **Square** layouts.
- Added a **Show Title Bar Lyrics** toggle under _Settings > Playback Settings > Show Title Bar Lyrics_. Disabled by default.
- Added a **Show Media Control Bar Lyrics** toggle under _Settings > Playback Settings > Show Media Control Bar Lyrics_. Disabled by default.
- Added **Font Settings** under _Settings > General_.

### Improved

- Improved playlist insertion so a new playlist created via an existing one is placed immediately after the target.
- Improved frontend-backend connection logic and enhanced error messages when login fails.
- Docker images no longer run services as the root user ([#79](https://github.com/any-listen/any-listen/issues/79)).
- Improved WebDAV data reading logic for better compatibility with more WebDAV services.
- Streamlined WebDAV service list creation so the app prompts for a password and saves it automatically to extension settings when adding a new service.

### Fixed

- Fixed lingering callbacks not being deregistered when observing local list changes.
- Fixed internal extension logs not refreshing in real time.
- Fixed karaoke lyrics rendering issues on older browsers.

---

### 新增

- 新增 **播放详情页封面样式** 选项，位于 _设置 > 播放详情页设置 > 封面样式_，可选择 **CD** 或 **正方形** 样式。
- 新增 **「显示标题栏歌词」** 选项，位于 _设置 > 播放设置 > 显示标题栏歌词_，默认关闭。
- 新增 **「显示媒体控制栏歌词」** 选项，位于 _设置 > 播放设置 > 显示媒体控制栏歌词_，默认关闭。
- 新增 **「字体设置」**，位于 _设置 > 基本设置_。

### 优化

- 优化新列表创建位置，通过点击已有列表创建新列表时，新列表会立即插入到目标列表之后。
- 优化前端与后端的连接逻辑，并改进登录失败时的错误提示信息。
- Docker 镜像不再以 root 用户运行服务（[#79](https://github.com/any-listen/any-listen/issues/79)）。
- 优化 WebDAV 数据读取逻辑，改进与更多 WebDAV 服务的兼容性。
- 优化 WebDAV 服务列表创建流程，添加新 WebDAV 服务列表时应用会弹窗提示设置密码并自动保存至扩展设置。

### 修复

- 修复本地列表变更监听时残留回调未正确注销的问题。
- 修复内部扩展日志未实时更新的问题。
- 修复在低版本浏览器下卡拉 OK 歌词显示异常的问题。

## [0.4.0](https://github.com/any-listen/any-listen-web-server/compare/v0.3.0...v0.4.0) - 2025-09-30

### Added

- Added **"Local List"** creation. You can create a local list via _List right-click menu > New List > Local List_. The local list will automatically update its content according to the songs in the directory created on your device.
- Added the creation of **"Remote List"**.
- Added basic support for reading and playing songs from **"WebDAV services"**. You can use this feature via _Playlist right-click menu > New Playlist > Remote Playlist_.
- Added **`httpProxy`** setting and **`HTTP_PROXY`** environment variable for configuring the proxy server. After setting the proxy server, all traffic will be forwarded to the proxy server.
- Added a **"Swap translated lyrics and romanized lyrics"** option in _Settings > Playback Settings_.
- Added a **"Bold lyrics font"** option in _Settings > Playback Details_. Enabled by default.
- Added support for reading and playing Any Listen lyrics tag data.

### Improved

- Improved the update notification mechanism. Now shows error messages when update checks or downloads fail ([#59](https://github.com/any-listen/any-listen/issues/59)).
- Improved lyrics display on the song details page for better readability.
- Improved the lyric scrolling speed when lyric scrolling is not delayed.
- Reset extension store cache on each page load.
- Improved song information matching and song tag information reading.

### Fixed

- Fixed an issue where lyrics from the previous song may still display when switching to a song without lyrics.
- Fixed a potential playlist synchronization issue.

### Changed

- Swapped the positions of **"Translated lyrics"** and **"Romanized lyrics"**. If you prefer the original order, you can enable the **"Swap translated lyrics and romanized lyrics"** option to revert.

---

### 新增

- 新增 **「本地列表」** 的创建，可通过 _列表右键菜单 > 新建列表 > 本地列表_ 创建，本地列表会自动跟随本机创建的列表歌曲目录内容更新
- 新增 **「远程列表」** 的创建
- 新增对 **「WebDAV 服务」** 内歌曲基本的读取与播放支持，可以在 _列表右键菜单 > 新建列表 > 远程列表_ 使用
- 新增 **`httpProxy`** 设置及 **`HTTP_PROXY`** 环境变量来设置代理服务器，设置代理服务器后所有流量将会被转发到代理服务器
- 新增 **「调换翻译歌词与罗马音歌词位置」** 选项，位于 _设置 > 播放设置_
- 新增 **「加粗歌词字体」** 选项，位于 _设置 > 播放详情页设置_，默认启用
- 新增 Any Listen 歌词标签数据读取与播放

### 优化

- 优化版本更新提示机制，增加检查和下载更新失败时的错误信息提示（[#59](https://github.com/any-listen/any-listen/issues/59)）
- 优化歌曲详情页的歌词显示效果，提升可读性
- 优化不延迟歌词滚动时的歌词滚动速度
- 每次加载页面时重置扩展商店缓存
- 优化歌曲信息匹配及歌曲标签信息读取

### 修复

- 修复从有歌词的歌曲切到无歌词的歌曲时，可能出现仍然显示上一首歌曲的歌词的问题
- 修复潜在播放列表同步问题

### 变更

- 调换 **「翻译歌词」** 和 **「罗马音歌词」** 的位置，若你想要恢复默认的行为，可开启 **「调换翻译歌词与罗马音歌词位置」** 选项

## [0.3.0](https://github.com/any-listen/any-listen-web-server/compare/v0.2.0...v0.3.0) - 2025-07-06

### Added

- Added lyric alignment setting on the playback details page
- Added Karaoke lyrics setting

### Optimized

- Adjusted the layout of control buttons on the playback bar
- Optimized the display effect of the changelog

### Fixed

- Fixed the issue where ambient sound effects failed to load

### Changed

- Updated default values for the playback details page, playback bar, and other default settings

---

### 新增

- 添加设置-播放详情页设置-歌词对齐方式设置
- 添加设置-播放设置-是否启用卡拉OK歌词设置

### 优化

- 调整播放栏控制按钮布局
- 优化更新日志显示效果

### 修复

- 修复环境音效加载失败的问题

### 变更

- 更新播放详情页、播放栏等默认设置的默认值

## [0.2.0](https://github.com/any-listen/any-listen-web-server/compare/v0.1.0...v0.2.0) - 2025-06-22

### Added

- Added the ability to add songs by selecting a folder, which will scan the selected directory and its subdirectories for songs
- Added extension management
- Added version checking
- Added icons to the navigation menu
- Improved proxy handling
- Added playback bar style settings
- Added extension icon display
- Added online extension store list loading and online extension installation/upgrading
- Added basic playback details page
- Added settings for playback details, playback settings for displaying lyric translations and romaji

### Improved

- Improved version check popup UI and fixed new version content display issues
- Improved virtual scrollbar appearance
- Updated scroll handling for better performance

### Fixed

- Fixed Flac file lyric reading issues
- Fixed issues when `allowPublicDir` is set to `/`
- Fixed music cover size issue in playback bar on Safari browser
- Fixed notification bubbles being covered by popups
- Fixed playlist synchronization issues
- Fixed played list update issues

---

### 新增

- 新增选择文件夹的方式添加歌曲，将会扫描所选目录及子目录内的歌曲
- 添加扩展管理
- 添加版本检查
- 为导航菜单添加图标
- 完善代理处理
- 新增播放栏样式设置
- 添加扩展图标显示
- 添加在线扩展商店列表加载与在线扩展安装、升级
- 添加基础的播放详情页
- 添加设置-播放详情设置，播放设置-显示歌词翻译、罗马音设置

### 优化

- 优化版本检查弹窗 UI 及修复新版本内容显示问题
- 优化虚拟滚动条显示效果
- 更新滚动处理以提高性能

### 修复

- 修复 Flac 文件歌词读取问题
- 修复 `allowPublicDir` 为 `/` 时出现的问题
- 修复 Safari 浏览器播放栏音乐图片大小问题
- 修复通知气泡被弹出层遮挡的问题
- 修复播放列表同步问题
- 修复已播放列表更新问题

## 0.1.0 - 2025-01-26

First version 🎉
