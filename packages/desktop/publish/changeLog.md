<!--- @lang: en-us -->

### Added

- Added a **Show Current Song Playback Progress in Taskbar** option under _Settings > Playback Settings_ ([#279](https://github.com/any-listen/any-listen/issues/279)).
- Added a **Classic Lyrics Window Width Scale** setting to adjust the lyrics window width, located under _Settings > Desktop Lyrics Mode Settings_.
- Added a **Song Source Switching** feature, available from the right-click menu for songs in the song list.
- Added the built-in **Inter Variable** font as the preferred default font ([#278](https://github.com/any-listen/any-listen/issues/278)).
- Added a **Horizontal Alignment** option for **Classic Desktop Lyrics** under _Settings > Desktop Lyrics Settings > Classic Lyrics_ ([#299](https://github.com/any-listen/any-listen/issues/299)).
- Added **Song Position Adjustment**, available from the song list context menu ([#302](https://github.com/any-listen/any-listen/issues/302)).

### Improved

- Improved window border rendering when using native system windows on Windows ([#230](https://github.com/any-listen/any-listen/issues/230)).
- Improved multiline desktop lyrics mode so that the active line's line spacing is no longer scaled when scaling is disabled.

### Fixed

- Fixed an issue where the file save dialog API could not select folders ([#285](https://github.com/any-listen/any-listen/issues/285)).
- Fixed lyrics display issue when switching songs ([#284](https://github.com/any-listen/any-listen/issues/284)).
- Fixed an issue where some lyrics did not wrap properly.
- Fixed an issue where the multi-line lyrics window could not be freely resized when desktop lyrics dynamically switched from **Classic Lyrics Mode** to **Multi-line Lyrics Mode**.
- Fixed an issue with `setTimeout`-related APIs in the extension-isolated API environment ([#301](https://github.com/any-listen/any-listen/issues/301)).
- Fixed an issue where fullscreen mode was unavailable on Windows ([#291](https://github.com/any-listen/any-listen/issues/291)).
- Fixed an issue where the window was not displayed on Linux when using Wayland.

---

<!--- @lang: zh-cn -->

### 新增

- 新增 **「在任务栏上显示当前歌曲播放进度」** 选项，位于 _设置 > 播放设置_（[#279](https://github.com/any-listen/any-listen/issues/279)）。
- 新增 **「经典歌词窗口宽度系数」** 设置，用于调整歌词窗口宽度，位于 _设置 > 桌面歌词模式设置_。
- 新增 **「歌曲换源」** 功能，可在歌曲列表中通过歌曲右键菜单使用。
- 新增内置 **「Inter Variable」** 字体作为首选默认字体（[#278](https://github.com/any-listen/any-listen/issues/278)）。
- 经典桌面歌词新增 **「水平对齐方式」** 选项，可在 _设置 > 桌面歌词设置 > 经典歌词_ 中调整（[#299](https://github.com/any-listen/any-listen/issues/299)）。
- 新增 **「歌曲位置调整」** 功能，可在歌曲列表右键菜单中使用（[#302](https://github.com/any-listen/any-listen/issues/302)）。

### 优化

- 优化 Windows 下使用原生系统窗口时的窗口边框显示效果（[#230](https://github.com/any-listen/any-listen/issues/230)）。
- 优化桌面歌词多行模式，未启用缩放时不再缩放激活行的行距。

### 修复

- 修复文件保存弹窗 API 无法选择文件夹的问题（[#285](https://github.com/any-listen/any-listen/issues/285)）。
- 修复切换歌曲时的歌词显示问题（[#284](https://github.com/any-listen/any-listen/issues/284)）。
- 修复某些歌词不换行的问题。
- 修复桌面歌词从 **「经典歌词模式」** 动态切换到 **「多行歌词模式」** 时，多行歌词窗口无法自由调节大小的问题。
- 修复扩展隔离 API 环境的 `setTimeout` 相关 API 异常问题（[#301](https://github.com/any-listen/any-listen/issues/301)）。
- 修复 Windows 下无法全屏的问题（[#291](https://github.com/any-listen/any-listen/issues/291)）。
- 修复 Linux 下使用 Wayland 时窗口不显示的问题。
