import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const skill = read('skills/answer-me-with-html/SKILL.md');
const css = read('skills/answer-me-with-html/styles/global.css');
const files = readdirSync(new URL('skills/answer-me-with-html/', root), { recursive: true })
  .map((path) => path.replaceAll('\\', '/'));

test('active skill ships instructions, CSS and only a routing helper, not a renderer', () => {
  assert.deepEqual(files.sort(), ['SKILL.md', 'styles', 'styles/global.css',
    'scripts', 'scripts/detect-output.mjs'].sort());
});

test('agent authors HTML directly without an intermediate format or renderer', () => {
  assert.match(skill, /Write the final HTML directly/);
  assert.match(skill, /Do not write an extended Markdown draft/);
  assert.match(skill, /No Node\.js is required/);
  assert.doesNotMatch(skill, /\bam\.mjs|\bam render\b|\bam patch\b|CLAUDE_SKILL_DIR|\breferences\//);
  assert.match(skill, /<!doctype html>/);
});

test('inline delivery requires verified capabilities and TUI stays readable', () => {
  assert.match(skill, /verified native interface/);
  assert.match(skill, /file-preview-only interface still uses file mode/);
  assert.match(skill, /cannot intercept or\s+redirect arbitrary model messages/);
  assert.match(skill, /Never dump raw HTML or a fenced HTML block into TUI chat/);
  assert.match(skill, /no HTML file needs to be created unless/);
  assert.match(skill, /If inline presentation fails/);
  assert.match(skill, /If the user forbids saving files/);
});

test('style precedence and session persistence are explicit', () => {
  const explicit = skill.indexOf('1. **Explicit style requirements');
  const workspace = skill.indexOf('2. **Workspace style');
  const global = skill.indexOf('3. **Global default');
  assert.ok(explicit >= 0 && explicit < workspace && workspace < global);
  assert.match(skill, /answer-with-html-style\/style\.css/);
  assert.match(skill, /including later sessions/);
  assert.match(skill, /Do not create a workspace style\s+folder just to copy/);
  assert.match(skill, /one-page-only style/);
  assert.match(skill, /leave the saved workspace CSS alone/);
  assert.match(skill, /replacement/, 'workspace stylesheet is complete, not a partial override');
});

test('CSS is embedded as an offline snapshot and unsafe dependencies are handled', () => {
  assert.match(skill, /embed its contents into one `<style>`/);
  assert.match(skill, /Do not emit an absolute file-system CSS link/);
  assert.match(skill, /Later CSS\s+edits affect newly generated or explicitly updated pages/);
  assert.match(skill, /closing\s+`<\/style` sequence/);
  assert.match(skill, /@import/);
  assert.match(skill, /Inspect symlinks before writing/);
  assert.match(skill, /workspace is read-only/);
});

test('no promotional source is bundled or added to generated pages', () => {
  for (const content of [skill, css]) {
    assert.doesNotMatch(content, /QingYunA|github\.com|raw\.githubusercontent|Star on GitHub|am-colophon|<meta name="generator"/i);
  }
  assert.match(skill, /No product byline, generator metadata/);
  assert.match(skill, /repository promotion/);
  assert.match(skill, /No.*telemetry|telemetry, update check/);
});

test('generic UI, automatic execution and external resources are prohibited', () => {
  assert.match(skill, /Default to no JavaScript/);
  assert.match(skill, /Never add a generic toolbar, theme picker, dark-mode switch, font-size/);
  assert.match(skill, /Do not automatically open a browser/);
  assert.match(skill, /Avoid third-party scripts, fonts, and external resources/);
});

test('global stylesheet covers every documented component and diagram token', () => {
  for (const className of ['answer-page', 'page-header', 'lead', 'panel-grid', 'panel',
    'panel-wide', 'stack', 'muted', 'sources', 'callout', 'badge', 'table-wrap',
    'diagram', 'steps', 'flow', 'flow-node']) {
    assert.ok(css.includes(`.${className}`), className);
  }
  for (const token of ['text', 'muted', 'accent', 'border', 'surface', 'success', 'warning', 'danger']) {
    assert.ok(css.includes(`--${token}:`), token);
  }
});

test('global stylesheet includes responsive, accessible and print behavior without network loads', () => {
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media print/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /overflow-x: auto/);
  assert.doesNotMatch(css, /@import|url\(|https?:|<\/style|font-face|data-am|localStorage/i);
  assert.equal((css.match(/{/g) ?? []).length, (css.match(/}/g) ?? []).length);
});

test('plugin commands no longer invoke the retired renderer or settings CLI', () => {
  for (const name of ['config', 'clean']) {
    const command = read(`skills/commands/${name}.md`);
    assert.doesNotMatch(command, /am\.mjs|!`|allowed-tools: Bash/);
  }
  assert.match(read('skills/commands/config.md'), /answer-with-html-style\/style\.css/);
  assert.match(read('skills/commands/clean.md'), /confirmation/);
});

test('only the active package remains, without legacy entry points or dependencies', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.private, true);
  assert.equal(pkg.bin, undefined);
  assert.equal(pkg.main, undefined);
  assert.equal(pkg.dsh, undefined);
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(pkg.scripts.build, undefined);
  assert.equal(pkg.scripts.test, 'node --test test/*.test.js');
  for (const path of ['src', 'bin', 'scripts', 'site', 'bench', 'marketplace',
    'examples', 'changelog', 'locale', 'docs', 'index.js', 'cordis.patch.yml',
    'skills/answer-me-with-html/scripts/am.mjs']) {
    assert.equal(existsSync(new URL(path, root)), false, path);
  }
});

test('plugin metadata and lockfile match the dependency-free package', () => {
  const pkg = JSON.parse(read('package.json'));
  const market = JSON.parse(read('.claude-plugin/marketplace.json'));
  assert.equal(market.owner.name, 'pureSaviour');
  assert.equal(market.plugins[0].version, pkg.version);
  assert.equal(market.plugins[0].source, './skills');
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.deepEqual(Object.keys(lock.packages), ['']);
  assert.equal(read('skills/LICENSE'), read('LICENSE'));
});

test('local documentation links reference existing files', () => {
  for (const file of ['README.md', 'README.zh-CN.md', 'INSTALL.md', 'CONTRIBUTING.md', 'SECURITY.md']) {
    const doc = read(file);
    for (const match of doc.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(?:https?:|#)/.test(target)) continue;
      assert.equal(existsSync(new URL(target, root)), true, `${file}: ${target}`);
    }
  }
});
