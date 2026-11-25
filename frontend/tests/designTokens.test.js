import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkDesignTokens } from '../scripts/check-design-tokens.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

test('the real project passes the design-token check', async () => {
  const { failures, stats } = await checkDesignTokens(projectRoot);
  assert.deepEqual(failures, []);
  assert.ok(stats.tokens > 20);
  assert.ok(stats.files > 30);
});

test('the linter catches violations (hex, raw palette, unknown token, undefined var, bad triplet)', async () => {
  const root = mkdtempSync(join(tmpdir(), 'veltrio-lint-'));
  try {
    mkdirSync(join(root, 'src/styles'), { recursive: true });
    writeFileSync(join(root, 'src/styles/tokens.css'), ':root {\n  --color-brand: 16 185 129;\n  --color-broken: 300 0 0;\n}\n');
    writeFileSync(
      join(root, 'tailwind.config.js'),
      "const color = (n) => `rgb(var(--color-${n}) / <alpha-value>)`;\nexport default { theme: { colors: { brand: color('brand') } } };\n"
    );
    writeFileSync(
      join(root, 'src/Bad.jsx'),
      [
        'export const a = "bg-emerald-500 text-brand";',
        'export const b = "#ff00aa";',
        'export const c = "bg-brandd";',
        'export const d = "var(--color-missing)";',
        'export const e = "bg-brand text-brand/50";',
      ].join('\n')
    );

    const { failures } = await checkDesignTokens(root);
    const joined = failures.join('\n');
    assert.match(joined, /raw palette class "bg-emerald-500"/);
    assert.match(joined, /hard-coded color #ff00aa/);
    assert.match(joined, /unknown color token class/);
    assert.match(joined, /--color-missing/);
    assert.match(joined, /--color-broken must be an "R G B" triplet/);
    assert.match(joined, /--color-broken is not mapped/);
    assert.doesNotMatch(joined, /Bad\.jsx:5/); // valid classes on line 5 are not flagged
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
