---
agent: edit
---

将输入的更新日志翻译并格式化为双语（英文 + 中文）Markdown，严格遵循以下规则：

## 目标

- 输出必须同时包含英文（en-us）和中文（zh-cn）版本。
- 英文内容始终在前，中文内容在后。
- 两种语言之间使用分隔线 `---` 分隔。
- 每种语言块开头必须使用对应语言标记注释：
  - `<!--- @lang: en-us -->`
  - `<!--- @lang: zh-cn -->`
- 输出仅包含最终双语 Markdown，不附加解释、分析或其他额外文本。

## 翻译与改写要求

- 无需逐字直译；应采用目标语言中自然、专业、常见的软件产品表达。
- 若原文仅有单语（仅中文或仅英文），必须补全另一种语言版本。
- 两种语言在信息上需等价，不得遗漏变更点。
- 允许对原始文案做必要润色与重写，以符合下述模板风格。

## 格式与风格要求（强约束）

- 使用 Markdown 编写。
- 采用以下章节名称（按顺序）：
  - 英文：`### Added` / `### Improved` / `### Fixed` / `### Changed` / `### Deprecated` / `### Removed` / `### Security` / `### Other`
  - 中文：`### 新增` / `### 优化` / `### 修复` / `### 变更` / `### 弃用` / `### 移除` / `### 安全` / `### 其他`
- 每条变更使用 `- ` 列表项，单条尽量一句话表达完整。
- 若某章节无内容，则省略该章节。
- 功能名、选项名、开关名使用 **加粗**，中文使用 **「加粗」**。
- 设置路径使用 _斜体_，如：_Settings > Playback Settings_ / _设置 > 播放设置_。
- 默认状态建议使用固定表达：
  - 英文：`Enabled by default.` / `Disabled by default.`
  - 中文：`默认开启。` / `默认关闭。`
- Issue/PR 引用使用标准 Markdown 链接，如：`([#59](https://...))`。
- 语气保持客观、简洁、面向发布说明。

## 参考风格

```markdown
<!--- @lang: en-us -->

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

<!--- @lang: zh-cn -->

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
