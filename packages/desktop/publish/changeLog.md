<!--- @lang: en-us -->

### Added

- Added an **Online Resources** section under _Settings > Online Resources_. Disabled by default.
- Added an **Ignore Local Duplicate and Embedded Lyrics** option under _Settings > Playback Settings_. When enabled, the app ignores same-name local LRC files and embedded lyrics in local tracks, then attempts to fetch lyrics from other sources.
- Added an **Audio Output Device** setting under _Settings > Playback Settings_ ([#161](https://github.com/any-listen/any-listen/issues/161)).
- Added a **Disable Song Switching** option to the song switching mode ([#161](https://github.com/any-listen/any-listen/issues/161)).
- Added a **Preferred Playback Quality** option under _Settings > Playback Settings_, defaulting to **128k**.
- Added an **Extension Detail** page; clicking an extension item in the extension list now displays its full details.
- Added a **Lyrics Context Menu** on the Now Playing page to adjust lyrics size and lyrics offset.
- Added a **Song Comments Display** feature, available from the song list context menu and the playback bar.
- Added a **Song Insert Position in List** option under _Settings > List Settings_. The default position is **Top**.
- Added a **Show List Action Buttons** setting. Enabled by default.
- Added a **Favorite** button to the playback bar for toggling the favorite status of the current track.
- Added song index numbers and **Play** / **Favorite** action buttons to song list items.
- Added desktop lyrics.

### Improved

- Improved cover loading in the song list to display previously loaded covers faster ([#156](https://github.com/any-listen/any-listen/issues/156)).
- No longer treat `_` as a separator for multiple artist names ([#191](https://github.com/any-listen/any-listen/issues/191)).
- Improved the implementation of context menu separators ([#198](https://github.com/any-listen/any-listen/issues/198)).
- Improved custom scrollbar rendering consistency across platforms.
- Added a security notice for the Windows Legacy version ([#206](https://github.com/any-listen/any-listen/issues/206)).
- Allowed the window to be dragged via the popup header.
- Added a confirmation step before removing items from **My List** ([#234](https://github.com/any-listen/any-listen/issues/234)).

### Fixed

- Fixed an issue where the currently playing **Play Later** track was unexpectedly removed from the playlist when the player was reloaded.
- Fixed an issue where **Window Size Settings** could still be updated while in full-screen mode.
- Fixed an issue where changes to **Font Settings** did not take effect in full-screen mode ([#189](https://github.com/any-listen/any-listen/issues/189)).
- Fixed an issue where proxy service validation failed for URLs with query parameters.
- Fixed an issue where local song covers were not re-read from local storage with priority after clearing the cache.
- Fixed an issue where the first item could be missing when reading data from certain WebDAV services ([#180](https://github.com/any-listen/any-listen/issues/180)).
- Fixed an issue where fullscreen mode could not be entered after changing window size settings when using native window style on Windows ([#190](https://github.com/any-listen/any-listen/issues/190)).
- Fixed an issue where extension package downloads did not use the configured proxy settings ([#194](https://github.com/any-listen/any-listen/issues/194)).
- Fixed an issue where draggable window regions remained functional when popup layers were present ([#200](https://github.com/any-listen/any-listen/issues/200)).
- Fixed an issue where playlists could become out of sync with song lists in some cases.

### Security

- Added hash verification for extension packages during installation.

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **「在线资源」** 板块，位于 _设置 > 在线资源_，默认关闭。
- 新增 **「忽略本地歌曲的同名及内嵌歌词」** 选项，位于 _设置 > 播放设置_。启用后会忽略本地歌曲同名 LRC 歌词及文件内嵌歌词，并尝试从其他渠道获取歌词。
- 新增 **「音频输出设备」** 设置，位于 _设置 > 播放设置_（[#161](https://github.com/any-listen/any-listen/issues/161)）。
- 歌曲切换模式新增 **「禁用歌曲切换」** 选项（[#161](https://github.com/any-listen/any-listen/issues/161)）。
- 新增 **「优先播放音质」** 选项，位于 _设置 > 播放设置_，默认 **128k**。
- 新增 **「扩展程序详情信息」** 界面，点击扩展列表的扩展项将显示该扩展的详细信息。
- 新增 **「歌词右键菜单」**，可用于调整歌词大小与歌词偏移。
- 新增 **「歌曲评论显示」** 功能，可在歌曲列表右键菜单与播放栏中使用。
- 新增 **「添加歌曲到列表时的位置」** 选项，位于 _设置 > 列表设置_，默认顶部。
- 新增 **「显示列表操作按钮」** 设置，默认开启。
- 播放栏新增 **「收藏歌曲」** 按钮，点击可切换当前播放歌曲的收藏状态。
- 歌曲列表项新增歌曲序号与 **「播放」**、**「收藏」** 操作按钮。
- 新增桌面歌词。

### 优化

- 优化歌曲列表内封面加载机制，加快已加载过封面的显示速度 ([#156](https://github.com/any-listen/any-listen/issues/156))。
- 不再将 `_` 认为是多个歌手名字的分隔符（[#191](https://github.com/any-listen/any-listen/issues/191)）。
- 优化上下文菜单分割线实现效果（[#198](https://github.com/any-listen/any-listen/issues/198)）。
- 优化自定义滚动条在各平台上的显示效果。
- 为 Windows Legacy 版本添加安全提示（[#206](https://github.com/any-listen/any-listen/issues/206)）。
- 允许通过弹窗头部拖动窗口。
- 移除 **「我的列表」** 条目前新增二次确认（[#234](https://github.com/any-listen/any-listen/issues/234)）。

### 修复

- 修复正在播放的 **「稍后播放」** 歌曲在重新加载播放器时被意外从播放列表移除的问题。
- 修复全屏模式下仍可更新 **「窗口大小设置」** 的问题。
- 修复全屏模式下更新 **「字体设置」** 不生效的问题（[#189](https://github.com/any-listen/any-listen/issues/189)）。
- 修复代理服务校验带参数 URL 异常的问题。
- 修复缓存被清空后，本地歌曲封面未优先从本地重新读取的问题。
- 修复读取某些 WebDAV 服务时，丢失第一项内容的问题（[#180](https://github.com/any-listen/any-listen/issues/180)）。
- 修复在 Windows 下使用系统原生窗口样式时，更改窗口大小设置后无法进入全屏的问题（[#190](https://github.com/any-listen/any-listen/issues/190)）。
- 修复配置了代理时下载扩展文件未使用代理的问题（[#194](https://github.com/any-listen/any-listen/issues/194)）。
- 修复存在弹出层时的窗口可拖动区域仍然会工作的问题（[#200](https://github.com/any-listen/any-listen/issues/200)）。
- 修复播放列表在某些情况下与歌单不同步更新的问题。

### 安全

- 安装扩展包时新增 hash 值校验。
