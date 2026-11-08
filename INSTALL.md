# Install the direct-HTML skill

The skill contains instructions and a shared CSS stylesheet. It does not need
npm dependencies, a renderer, or a build step. An optional environment probe uses
Node.js if already available; otherwise default to workspace-file delivery.

1. Locate the host's skill installation directory.
2. Back up an existing `answer-me-with-html` installation outside the active
   skill discovery directory. Preserve custom styles before replacing files.
3. Copy this checkout's `skills/answer-me-with-html` directory into it.
4. Ensure the active package contains `SKILL.md`, `styles/global.css`, and
   `scripts/detect-output.mjs`. Remove the retired `scripts/am.mjs` bundle and
   old `references/` and `licenses/` directories after backing them up. Keep the
   new routing helper. Do not leave duplicate active copies of the same skill.
5. Reload skills or start a new session if required by the host.
6. Ask for a visual HTML explanation. Verify it has embedded CSS and contains no
   product byline, marketing links, theme selector, or font-size toolbar.
   TUI/unknown hosts should return a workspace-file link, never raw HTML in chat.
   A verified native HTML/artifact interface may display the HTML directly
   without saving a file. A WebView alone does not establish this capability.

The global default is `<installed-skill>/styles/global.css`. A project's custom
style belongs at `<workspace>/answer-with-html-style/style.css`. Explicit session
style requests update the project file unless the user says one-page-only.

Use this fork when installing or updating; reinstalling the original package
will restore its different workflow. See [README.md](README.md) for the delivery
and styling contract. The old CLI and its build pipeline have been removed.
