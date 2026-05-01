---
agent: agent
---

请根据参数执行 README 多语言同步与翻译任务。

默认行为（无参数执行）：

- 当未提供参数时，自动进入“批量同步模式”。
- 以 `${workspaceFolder}/docs/README_zh.md` 为唯一源文件。
- 自动发现已存在的其他语言 README 并逐个同步翻译：
  - `${workspaceFolder}/README.md`（英文）
  - `${workspaceFolder}/docs/README_*.md`（排除 `README_zh.md`）
- 仅更新“已存在”的目标语言文件，不在无参数模式下新建语言文件。

输入参数：

- 源文件（简体中文）：`${workspaceFolder}/docs/README_zh.md`
- 英文参考文件：`${workspaceFolder}/README.md`
- 目标语言：`${1}`（示例：`en`、`zh-tw`、`ja`）
- 目标文件：`${workspaceFolder}/docs/README_${1}.md`（若 `${1}` 为 `en`，目标文件为 `${workspaceFolder}/README.md`）
- 任务意图：`${2}`（本次通常为“优化提示词”或“同步翻译”）

参数规则：

- 提供 `${1}` 时：仅处理指定目标语言文件。
- 未提供 `${1}` 时：按“默认行为（无参数执行）”批量处理所有已发现的其他语言 README。

执行要求：

1. 使用 Markdown 语法输出，保持标题层级、列表、表格、代码块、引用等结构完整。
2. 译文必须采用目标语言的专业术语与常用表达，语法自然、表达地道，不做逐字硬译。
3. 以简体中文版本为主基准，确保目标语言版本在结构与信息量上完全对齐。
4. 若简体中文版本新增、修改或删除内容，需同步更新所有其他语言版本，避免信息漂移。
5. 英文 License 作为权威基准：
   - 不修改英文 README（`${workspaceFolder}/README.md`）中的 License 原文内容。
   - 其他语言版本的 License 必须基于英文 License 准确翻译，语义完整，不增删法律含义。
6. 所有 README 顶部必须包含完整且一致的语言导航：
   - 当前语言名称不加链接。
   - 其他语言名称必须添加正确相对路径链接。
   - 导航项顺序在所有语言文件中保持一致。
   - 示例：
     - 英文：`English | [简体中文](./docs/README_zh.md) | [繁體中文](./docs/README_zh-tw.md)`
     - 简体中文：`[English](../README.md) | 简体中文 | [繁體中文](README_zh-tw.md)`

操作流程：

1. 先对比 `${workspaceFolder}/docs/README_zh.md` 与目标语言文件，定位缺失或过期段落。
2. 再以 `${workspaceFolder}/README.md` 校验 License 段落，确保术语与条款语义一致。
3. 更新目标文件中的导航、正文与 License。
   - 无参数模式下，对所有已发现目标文件重复执行以上步骤。
4. 自检以下项目：
   - 导航是否完整且链接可用
   - 章节结构与顺序是否与简体中文一致
   - 代码块、命令、配置键名、环境变量名是否保持原样
   - 专有名词（如 WebDAV、Docker、Node.js、GitHub）是否保持规范写法

输出约束：

- 仅修改目标语言对应的 README 文件内容，不输出额外说明性文本。
- 不编造不存在的功能、参数或链接。
- 带参数模式下，若目标语言文件不存在，则按上述规则创建完整文件。
- 无参数模式下，仅处理已发现的目标语言文件，不创建新文件。
