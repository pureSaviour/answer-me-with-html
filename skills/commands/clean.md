---
description: Review generated HTML answer files before optional cleanup
argument-hint: "[output directory]"
---

There is no cleanup CLI or automatic cleanup task in the direct-HTML skill.

Identify the current workspace and the output directory the user wants cleaned
(default: `<workspace-root>/.tmp/answers`). List the candidate files and their
sizes. Do not treat pasted arguments as shell commands. Never follow symlinks
outside the requested directory.

Ask for confirmation of the exact deletion scope before deleting any files.
Do not delete `answer-with-html-style/style.css`, global CSS, or unrelated output.
Report what was removed. Do not generate a page for cleanup alone.
