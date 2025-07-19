---
mode: agent
---

将 ${workspaceFolder} 目录下的 README_zh.md 翻译到同目录下的 README.md 和其他 README\_\*.md 文件，主要规则如下：

- 翻译内容使用 markdown 语法编写
- README.md 为英文版本，其他语言的 README 文件命名为 README\_\*.md，其中 \* 为对应语言的缩写，如简体中文为`zh`
- 头部的 `English | 中文` 等为其他版本的 README 导航，当前语言的 README 对应的语言名称不需要链接，但需要为其他语言添加对应链接，
  例如 `English | 中文`，如果当前是英文 README，则`English`不需要链接，但需要添加其他语言的链接，如 `English | [中文](README_zh.md)`
- 翻译时不要求逐字翻译，只需尽量使用目标语言的专业术语和常用表达方式，符合目标语言的语法和常见表达习惯。
- 总是将英文版本 README 的 `## License` 部分的内容翻译到其他语言的 README 文件中
