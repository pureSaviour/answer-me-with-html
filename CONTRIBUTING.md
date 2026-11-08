# Contributing

## Scope

Keep the skill small: direct HTML authoring, complete shared CSS, conservative
capability routing, and no generated branding or generic settings toolbar.
Do not restore a Markdown renderer, theme catalog, website, or video pipeline.

## Layout

- `skills/answer-me-with-html/SKILL.md`: agent workflow and safety boundaries.
- `skills/answer-me-with-html/styles/global.css`: default component contract.
- `skills/answer-me-with-html/scripts/detect-output.mjs`: read-only routing probe.
- `skills/commands/`: stylesheet customization and confirmed cleanup commands.
- `test/`: dependency-free Node.js tests for the active package.

## Before submitting

1. Use Node.js 20+ and run `npm test`; no dependency installation is required.
2. Run `git diff --check`.
3. Add tests for changed routing rules and document any changed flags.
4. Keep unknown environments conservative. A host name or WebView is not proof
   of inline HTML support, and captured child stdout is not the main UI.
5. Keep project CSS and global CSS usable as complete stylesheets, with matching
   HTML classes, mobile overflow behavior, visible focus and print styling.
6. Keep source text and CSS as data. Do not add network requests, telemetry,
   credential reads, file writes, or host-tool calls to the routing probe.
7. Do not commit generated answer HTML, private code, local credentials, or backups.

Inspect an actual page on desktop and mobile when browser tools are available.
Test real native-artifact presentation separately from simulated probe flags;
passing a capability assertion in a test does not prove that a host supports it.
State any manual checks that could not run.

Preserve MIT copyright notices. Keep English and Chinese README behavior aligned.
