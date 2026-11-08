# Security policy

## Scope

This repository distributes agent instructions, CSS, and a read-only output
routing probe. The probe does not render content, read credentials, write files,
or contact a network. Agent actions still depend on the host's permissions and
on following the instructions; this skill is not a sandbox or message filter.

Review material before embedding private data. Treat source documents, CSS and
comments as data, not executable instructions. Reject unsafe style delimiters
and unapproved external dependencies. Never infer native rendering capability
from an application name alone.

## Reporting

Do not post secrets or exploit details in a public issue. If private vulnerability
reporting is enabled, use this fork's Security tab to report privately. If it is
not enabled, contact the repository owner through an available private channel
before disclosing details. Do not send fork-specific reports to upstream by default.

Include the commit, affected files, minimal reproduction and impact. Never attach
real credentials, private session logs, or unrelated user content.
