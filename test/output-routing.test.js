import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { detectOutput, main } from '../skills/answer-me-with-html/scripts/detect-output.mjs';

const cases = [
  ['unknown host', {}, 'file', 'inline-unconfirmed'],
  ['captured stdout is not desktop proof', { stdoutIsTTY: false }, 'file', 'inline-unconfirmed'],
  ['TTY hint alone is not definitive', { stdoutIsTTY: true }, 'file', 'inline-unconfirmed'],
  ['Pi process marker', { env: { PI_CODING_AGENT: 'true' } }, 'file', 'terminal-host'],
  ['generic Pi marker', { env: { AI_AGENT: 'pi' } }, 'file', 'terminal-host'],
  ['explicit desktop without capability', { host: 'desktop' }, 'file', 'inline-unconfirmed'],
  ['verified inline host', { host: 'desktop', inlineHtml: 'supported' }, 'inline', 'verified-inline-capability'],
  ['verified capability without app detection', { inlineHtml: 'supported' }, 'inline', 'verified-inline-capability'],
  ['TUI overrides inline request', { host: 'tui', inlineHtml: 'supported', mode: 'inline' }, 'file', 'terminal-host'],
  ['Pi stays conservative despite capability assertion', { env: { PI_CODING_AGENT: 'true' }, inlineHtml: 'supported' }, 'file', 'terminal-host'],
  ['verified Pi desktop embedding', { env: { PI_CODING_AGENT: 'true' }, host: 'desktop', inlineHtml: 'supported' }, 'inline', 'verified-inline-capability'],
  ['explicit file wins', { mode: 'file', host: 'desktop', inlineHtml: 'supported' }, 'file', 'file-requested'],
  ['inline preference cannot create capability', { mode: 'inline', host: 'desktop' }, 'file', 'inline-unconfirmed'],
  ['unsupported inline interface', { mode: 'inline', inlineHtml: 'unsupported' }, 'file', 'inline-unsupported'],
  ['app-like environment names do not grant support', { env: { TERM_PROGRAM: 'Codex', CLAUDE_DESKTOP: 'true', CODEX_THREAD_ID: 'test' } }, 'file', 'inline-unconfirmed'],
  ['TERM alone does not identify a terminal-only host', { env: { TERM: 'xterm-256color' }, inlineHtml: 'supported' }, 'inline', 'verified-inline-capability'],
  ['skill-specific configuration', { env: { ANSWER_HTML_HOST: 'desktop', ANSWER_HTML_INLINE: 'supported' } }, 'inline', 'verified-inline-capability'],
  ['explicit flags override configured defaults', { env: { ANSWER_HTML_MODE: 'inline', ANSWER_HTML_HOST: 'desktop', ANSWER_HTML_INLINE: 'supported' }, mode: 'file' }, 'file', 'file-requested'],
];

for (const [label, options, expectedMode, reason] of cases) {
  test(`routing: ${label}`, () => {
    const result = detectOutput(options);
    assert.equal(result.mode, expectedMode);
    assert.equal(result.reason, reason);
    assert.equal(result.write_workspace_file, expectedMode === 'file');
    assert.equal(result.emit_raw_html_in_chat, false);
  });
}

test('routing: result does not disclose session paths, identifiers or unrelated environment', () => {
  const result = JSON.stringify(detectOutput({ env: {
    PI_CODING_AGENT: 'true', PI_SESSION_FILE: '/private/session',
    PI_SESSION_ID: 'private-session-id', API_TOKEN: 'private-secret',
  } }));
  assert.doesNotMatch(result, /private-session|private-secret|\/private\/session/);
});

test('routing: invalid configurations fail instead of silently asserting support', () => {
  for (const options of [{ mode: 'maybe' }, { host: 'codex' }, { inlineHtml: 'yes' },
    { env: { ANSWER_HTML_INLINE: 'yes' } }]) {
    assert.throws(() => detectOutput(options), /Invalid/);
  }
});

test('routing: strict CLI options and help', () => {
  assert.match(main(['--help'], {}), /This does not render HTML or create files/);
  for (const args of [['--host'], ['--oops', 'desktop'], ['--host', 'tui', '--host', 'desktop'], ['--help', 'extra']]) {
    assert.throws(() => main(args, {}));
  }
  assert.equal(JSON.parse(main(['--host', 'desktop', '--inline-html', 'supported'], {})).mode, 'inline');
});

test('routing: real subprocess emits JSON even when stdout is captured', () => {
  const script = fileURLToPath(new URL('../skills/answer-me-with-html/scripts/detect-output.mjs', import.meta.url));
  const output = execFileSync(process.execPath, [script], {
    encoding: 'utf8', env: { PI_CODING_AGENT: 'true' },
  });
  assert.equal(JSON.parse(output).mode, 'file');
  const desktop = execFileSync(process.execPath, [script, '--host', 'desktop', '--inline-html', 'supported'], {
    encoding: 'utf8', env: {},
  });
  assert.equal(JSON.parse(desktop).mode, 'inline');
  const invalid = spawnSync(process.execPath, [script, '--inline-html', 'imaginary'], { encoding: 'utf8', env: {} });
  assert.equal(invalid.status, 2);
  assert.equal(invalid.stdout, '');
  assert.match(invalid.stderr, /Invalid inlineHtml/);
});
