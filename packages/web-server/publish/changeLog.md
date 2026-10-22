<!--- @lang: en-us -->

### Added

- Added a **Save as Regular Playlist** button to song lists in the Online Resources section. Selecting it creates a regular playlist and adds the songs to it.
- Added an **Automatic Sync** option to online list settings. Disabled by default.

### Improved

- Improved the **Add Songs** dialog with a horizontal layout and more playlist information.

### Fixed

- Fixed an issue where scrolling the mouse wheel over a number input changed both the input value and the page scroll position ([#298](https://github.com/any-listen/any-listen/issues/298)).
- Fixed a conflict between local keyboard shortcuts and text input in input fields ([#388](https://github.com/any-listen/any-listen/issues/388)).
- Fixed an issue where playback position was calculated incorrectly when adding songs to Play Next ([#389](https://github.com/any-listen/any-listen/issues/389)).
- Fixed inaccurate lyric progress positioning at certain font sizes ([#391](https://github.com/any-listen/any-listen/issues/391)).

### Changed

- Clicking **Play all** now automatically switches the play mode to **List loop** ([#379](https://github.com/any-listen/any-listen/issues/379)).
- Updated the default settings for the Now Playing page: set the **Lyrics Font Size** to 80, and disable **Bold Lyrics** and **Delayed Scrolling**.
- Online lists no longer sync remote lists automatically by default, including previously created lists. To enable automatic syncing for a list, turn it on in that list's settings.

---

<!--- @lang: zh-cn -->

### 新增

- 在线资源板块的歌曲列表中新增 **「收藏为普通列表」** 按钮，点击后会创建一个普通列表，并将当前列表中的歌曲添加到该列表。
- 在线列表设置新增 **「自动同步」** 选项，默认关闭。

### 优化

- 优化 **「添加歌曲」** 弹窗，采用横向布局并展示更多歌单信息。

### 修复

- 修复在数字输入框上滚动鼠标滚轮时，输入框数值和页面滚动位置同时改变的问题（[#298](https://github.com/any-listen/any-listen/issues/298)）。
- 修复本地快捷键与输入框输入冲突的问题（[#388](https://github.com/any-listen/any-listen/issues/388)）。
- 修复添加歌曲到稍后播放时播放位置计算异常的问题（[#389](https://github.com/any-listen/any-listen/issues/389)）。
- 修复特定字体大小设置下歌词定位进度不准确的问题（[#391](https://github.com/any-listen/any-listen/issues/391)）。

### 变更

- 点击 **「播放全部」** 时会自动将播放模式切换为 **「列表循环」**（[#379](https://github.com/any-listen/any-listen/issues/379)）。
- 调整播放详情页默认设置：将 **「歌词字体大小」** 设为 80，关闭 **「加粗歌词」** 和 **「延迟滚动」**。
- 新创建的在线列表和已有在线列表默认不再自动同步远程列表。如需自动同步某个列表，可在该列表的设置中启用。
