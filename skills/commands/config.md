---
description: Customize workspace CSS for directly authored HTML answers
argument-hint: "[visual style description]"
---

Read the sibling `answer-me-with-html/SKILL.md` and follow its style resolution
rules. This command no longer runs a CLI or offers theme, font-size, voice,
update, or browser settings.

User arguments: `$ARGUMENTS`

- With no arguments, report whether the workspace stylesheet or the global
  default is active. Ask what visual style the user wants.
- With a style description, update
  `<workspace-root>/answer-with-html-style/style.css` as a complete stylesheet,
  preserving the shared class contract and unrelated customizations.
- Change `<skill-directory>/styles/global.css` only when the user explicitly asks
  to change the global default. Project CSS still takes precedence.
- Do not generate a page unless a preview is requested. Report the CSS path.
