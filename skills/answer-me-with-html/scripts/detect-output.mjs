#!/usr/bin/env node
// Capability probe only: no rendering, file writes, network requests, or host APIs.
import { pathToFileURL } from 'node:url';

const choices = {
  mode: ['auto', 'file', 'inline'],
  host: ['auto', 'tui', 'desktop'],
  inlineHtml: ['unknown', 'supported', 'unsupported'],
};

function value(name, input, fallback) {
  const result = input ?? fallback;
  if (!choices[name].includes(result)) {
    throw new Error(`Invalid ${name}: expected ${choices[name].join('|')}`);
  }
  return result;
}

export function detectOutput({ env = {}, mode, host, inlineHtml, stdoutIsTTY = false } = {}) {
  const requested = value('mode', mode ?? env.ANSWER_HTML_MODE, 'auto');
  const configuredHost = value('host', host ?? env.ANSWER_HTML_HOST, 'auto');
  const capability = value('inlineHtml', inlineHtml ?? env.ANSWER_HTML_INLINE, 'unknown');
  const pi = env.AI_AGENT === 'pi' || /^(true|1)$/i.test(env.PI_CODING_AGENT ?? '');
  // Pi also has RPC/SDK hosts: a verified desktop adapter can override this
  // conservative process-marker hint with --host desktop and a capability flag.
  const resolvedHost = configuredHost !== 'auto' ? configuredHost : pi ? 'tui' : 'unknown';
  const base = {
    requested_mode: requested,
    host: resolvedHost,
    host_evidence: configuredHost !== 'auto' ? 'explicit' : pi ? 'pi-process-marker' : 'unconfirmed',
    inline_capability: capability,
    terminal_hint: Boolean(stdoutIsTTY),
  };
  const result = (mode, reason) => ({ ...base, mode, reason, write_workspace_file: mode === 'file', emit_raw_html_in_chat: false });
  if (requested === 'file') return result('file', 'file-requested');
  if (resolvedHost === 'tui') return result('file', 'terminal-host');
  if (capability !== 'supported') {
    return result('file', capability === 'unsupported' ? 'inline-unsupported' : 'inline-unconfirmed');
  }
  return result('inline', 'verified-inline-capability');
}

const HELP = `Usage: node detect-output.mjs [--mode auto|file|inline]
       [--host auto|tui|desktop] [--inline-html unknown|supported|unsupported]

Print one JSON routing decision. This does not render HTML or create files.
Pass supported only after verifying an actual HTML/artifact output interface.
A webview, a desktop app name, or a user preference is not capability evidence.
TUI hosts always use a workspace file. Unknown capability also falls back to file.
For a verified Pi RPC/SDK desktop adapter, pass --host desktop explicitly.

Optional skill-specific environment variables (not vendor conventions):
  ANSWER_HTML_MODE, ANSWER_HTML_HOST, ANSWER_HTML_INLINE
CLI flags take precedence. No stdout/TTY hint is proof of inline support.
`;

export function main(args, env = process.env, stdoutIsTTY = process.stdout.isTTY) {
  if (args.length === 1 && args[0] === '--help') return HELP;
  const flags = new Map([['--mode', 'mode'], ['--host', 'host'], ['--inline-html', 'inlineHtml']]);
  const options = { env, stdoutIsTTY };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 2) {
    const key = flags.get(args[i]);
    if (!key || seen.has(key) || args[i + 1] === undefined) throw new Error('Unknown, duplicate, or incomplete option. Use --help.');
    seen.add(key);
    options[key] = args[i + 1];
  }
  return `${JSON.stringify(detectOutput(options), null, 2)}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.stdout.write(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
