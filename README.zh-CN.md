# 用 HTML 回答

[English](README.md)

一个轻量的可视化回答 skill：agent 直接编写 HTML，并根据宿主实际能力选择
内联展示或工作区文件。不再包含 Markdown 渲染器、主题系统、工具栏或运行依赖。

## 工作流程

1. 调查问题，判断 HTML 可视化是否有帮助。
2. 在编写较长 HTML 前，检测合适的输出渠道。
3. 读取项目样式；没有项目样式时读取全局默认 CSS。
4. 直接编写语义化 HTML，并内嵌所选 CSS。
5. 通过已确认的宿主 HTML/Artifact 接口展示，或保存到工作区后返回摘要和链接。

| 环境或能力 | 输出方式 |
| --- | --- |
| 已验证的原生 HTML/Artifact 接口 | 通过真实接口内联展示，不必生成文件 |
| Pi 等 TUI | 保存工作区 HTML，聊天中不输出源码 |
| 桌面端有 WebView，但未确认内联接口 | 保存工作区 HTML |
| 内联展示失败 | 回退为文件；用户禁止保存时改用可读文本 |

应用名称、WebView 和 HTML 代码块都不等于内联渲染能力。不能猜测 Artifact 标签
或编造宿主工具。检测脚本不是消息拦截器，仍由 agent 按指引选择渠道并写入文件。

## 样式优先级

1. 本轮或 session 明确的用户样式要求。
2. 已有的 `<工作区>/answer-with-html-style/style.css`。
3. `<skill 安装目录>/styles/global.css`。

用户要求定制时，基于已有项目样式或全局默认，创建或修改完整的项目 `style.css`。
后续页面和 session 继续使用它。明确“仅这一页”时不修改持久化样式。
只有明确要求修改全局默认时才编辑安装目录 CSS。
没有定制要求且没有项目 CSS 时，不创建项目样式目录。

所选 CSS 内嵌到 HTML，生成的是离线快照；修改 CSS 不会自动影响旧页面。
文件输出默认保存在 `<工作区>/.tmp/answers/<主题>.html`。

## 安装

将 `skills/answer-me-with-html/` 复制到 agent 的 skill 目录即可，无需构建或安装依赖。
升级方式见 [INSTALL.md](INSTALL.md)。

```text
skills/answer-me-with-html/
  SKILL.md
  scripts/detect-output.mjs
  styles/global.css
```

如果已有 Node.js，可运行可选的只读检测脚本：

```sh
node /skill的绝对路径/scripts/detect-output.mjs
```

脚本只打印 JSON，不渲染、不写文件、不联网、不打开浏览器。
只有已经确认宿主具有真实内联接口后，才可以传入：

```sh
node /skill的绝对路径/scripts/detect-output.mjs --host desktop --inline-html supported
```

参数：

- `--mode auto|file|inline`
- `--host auto|tui|desktop`
- `--inline-html unknown|supported|unsupported`

可通过 skill 自定义环境变量 `ANSWER_HTML_MODE`、`ANSWER_HTML_HOST`、
`ANSWER_HTML_INLINE` 提供默认值，命令行参数优先。这些不是厂商内置变量。
能力声明仍需实际验证；TUI 和明确的文件要求优先于内联偏好。
能力未知、脚本失败或没有 Node.js 时，默认文件模式，不自动安装运行时。

Pi 进程标记不能完全确定 UI 类型：已验证的 RPC/SDK 桌面嵌入可以用
`--host desktop` 覆盖保守判断。子进程的 `isTTY=false` 也不能证明是桌面 UI。

## 插件命令

`skills/` 下保留两条插件命令：

- `config`：定制项目或全局 CSS，不再操作主题或字号设置。
- `clean`：列出候选 HTML 文件，确认后才删除。

生成页面不添加推广署名、遥测、自动联网或通用工具栏。
与问题相关的来源引用仍然允许。默认使用原生 HTML/CSS，脚本仅限必要的任务功能。

## 开发与验证

使用 Node.js 20+ 执行无依赖测试：

```sh
npm test
# 兼容别名：
npm run test:skill
```

无需构建。测试覆盖包装、输出规则、CSS、路由判断和真实子进程行为，
不代表已经验证所有宿主的视觉效果，也不能强制保证未来每次模型输出。
浏览器及真实原生内联接口需要分别测试。

旧 CLI、视频、网站、主题市场、依赖和过时测试已移除，这是不兼容的精简版本。
贡献说明见 [CONTRIBUTING.md](CONTRIBUTING.md)，安全说明见 [SECURITY.md](SECURITY.md)。

保留原始版权声明，采用 [MIT 许可证](LICENSE)。
