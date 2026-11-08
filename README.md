# Answer with HTML

[简体中文](README.zh-CN.md)

A lightweight agent skill for readable visual explanations. The agent writes
HTML directly and selects a delivery channel based on the host's verified
capabilities. No Markdown renderer, theme system, toolbar, or runtime dependencies.

## How it works

1. Investigate the user's question and decide whether visual HTML helps.
2. Detect the delivery channel before composing a substantial HTML answer.
3. Read the workspace stylesheet, or the bundled global default.
4. Write semantic HTML directly and embed the selected CSS.
5. Present it through a verified native HTML/artifact interface, or save it in
   the workspace and return a readable summary plus a file link.

| Host capability | Delivery |
| --- | --- |
| Verified native HTML/artifact rendering | Inline through the real host interface; no file required |
| TUI, including conservatively detected Pi | Workspace HTML file; no raw markup in chat |
| Desktop/WebView with no verified inline interface | Workspace file |
| Inline presentation fails | Fall back to a file, unless saving is forbidden |

A WebView or app name is not proof that ordinary assistant messages can render
HTML. The skill does not invent artifact tags or host tools. If files are
forbidden and inline rendering is unavailable, answer in readable text.

## Style priority

1. Apply an explicit request in the current turn/session.
2. Reuse `<workspace>/answer-with-html-style/style.css`, if present.
3. Otherwise read `<installed-skill>/styles/global.css`.

A custom style request creates or updates a complete project stylesheet at
`answer-with-html-style/style.css`, starting from the existing project style or
the global default. Later pages and sessions reuse it. A one-page-only request
does not overwrite saved CSS. Changing the global default requires an explicit
global request. With no customization, no project style folder is created.

CSS is embedded into the final HTML. Existing pages are snapshots; changing a
saved stylesheet affects new or explicitly updated pages, not old files.
File delivery defaults to `<workspace>/.tmp/answers/<topic>.html`.

## Install

Copy `skills/answer-me-with-html/` into your agent's skill directory. No build or
package installation is needed. See [INSTALL.md](INSTALL.md) for upgrade steps.

```text
skills/answer-me-with-html/
  SKILL.md
  scripts/detect-output.mjs
  styles/global.css
```

The optional routing probe uses Node.js when already available. It prints JSON
but does not generate files, render HTML, contact a network, or open a browser:

```sh
node /absolute/path/to/skill/scripts/detect-output.mjs
```

After verifying an actual inline HTML interface, an agent may pass:

```sh
node /absolute/path/to/skill/scripts/detect-output.mjs --host desktop --inline-html supported
```

Options:

- `--mode auto|file|inline`
- `--host auto|tui|desktop`
- `--inline-html unknown|supported|unsupported`

The skill-owned environment defaults are `ANSWER_HTML_MODE`, `ANSWER_HTML_HOST`,
and `ANSWER_HTML_INLINE`. Flags take precedence. These are not vendor variables.
Capability assertions must still be independently verified. TUI and explicit
file requests win over inline preference. With unknown capability, no Node.js,
or a failed probe, use file delivery without installing anything.

Pi markers identify a launching process, not definitive UI capabilities: a
verified RPC/SDK desktop embedding can override the conservative TUI hint with
`--host desktop`. Captured stdout's `isTTY=false` is not evidence of a desktop UI.

The probe is not a message hook. The agent follows the routing instructions and
writes files itself; the script cannot intercept arbitrary model messages.

## Plugin commands

The retained plugin package under `skills/` also provides:

- `config`: customize project/global CSS; no theme or font-size settings UI.
- `clean`: list candidate answer files and request approval before deleting them.

Generated answers add no byline, promotion, telemetry, automatic network calls,
or generic controls. Ordinary task source citations remain allowed. Native HTML
and CSS are preferred; scripts are task-specific exceptions, not defaults.

## Development

Use Node.js 20+ to run the dependency-free tests:

```sh
npm test
# Compatibility alias:
npm run test:skill
```

There is no build step. Tests cover packaging, delivery rules, CSS coverage,
probe decisions and actual subprocess behavior. They do not prove future agent
compliance or visual rendering in every host. Browser and native-artifact checks
must be performed separately when those interfaces are available.

Old CLI, video, website, theme-marketplace code, dependencies and obsolete tests
have been removed. This is an incompatible simplification, not a replacement CLI.
See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

MIT licensed; original copyright notices are retained in [LICENSE](LICENSE).
