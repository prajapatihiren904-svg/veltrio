#!/usr/bin/env node
/**
 * Design-token linter. Run with: npm run lint:tokens
 *
 * Guarantees that the centralized design system is actually respected:
 *  1. every --color-* token in tokens.css is a valid "R G B" triplet and is mapped in tailwind.config.js
 *  2. every var(--token) used anywhere is defined in tokens.css
 *  3. components contain no hard-coded colors (hex, rgb(12 34 56), hsl) and no raw Tailwind palette classes
 *  4. every semantic color class (bg-surface-raised, text-content-muted ...) exists in the Tailwind theme
 */
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.css']);
const PREFIXES = 'bg|text|border|ring-offset|ring|from|to|via|fill|stroke|divide|outline|placeholder|decoration|accent|caret';
const FAMILIES = 'canvas|surface|line|content|brand|success|warning|danger|info';
const RAW_PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';

const HEX = /(?<=["'`\s(:,])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?)\(\s*\d/g;
const RAW_PALETTE_CLASS = new RegExp(`(?<![\\w-])(?:${PREFIXES})-(?:${RAW_PALETTE})(?:-\\d{2,3})?(?:\\/[\\w.]+)?(?![\\w-])`, 'g');
const SEMANTIC_CLASS = new RegExp(
  `(?<![\\w-])(?:${PREFIXES})-((?:${FAMILIES})[\\w-]*)(?:\\/[\\w.]+)?(?![\\w-])`,
  'g'
);

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(path);
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
  });
}

/** Flattens the Tailwind colors object into the set of valid class suffixes. */
function collectColorNames(colors, prefix = '', names = new Set()) {
  for (const [key, value] of Object.entries(colors)) {
    if (value && typeof value === 'object') {
      collectColorNames(value, key === 'DEFAULT' ? prefix : `${prefix}${prefix ? '-' : ''}${key}`, names);
      if (value.DEFAULT && prefix === '') names.add(key);
    } else {
      names.add(key === 'DEFAULT' ? prefix : `${prefix}${prefix ? '-' : ''}${key}`);
    }
  }
  return names;
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

export async function checkDesignTokens(root) {
  const failures = [];
  const fail = (file, line, message) => failures.push(`${relative(root, file)}${line ? `:${line}` : ''}  ${message}`);

  const tokensPath = join(root, 'src/styles/tokens.css');
  const configPath = join(root, 'tailwind.config.js');
  const tokensCss = readFileSync(tokensPath, 'utf8');
  const configText = readFileSync(configPath, 'utf8');
  const config = (await import(pathToFileURL(configPath).href)).default;

  // 1. token definitions
  const tokens = new Map();
  const stripped = tokensCss.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of stripped.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) tokens.set(match[1], match[2].trim());

  for (const [name, value] of tokens) {
    if (!name.startsWith('--color-')) continue;
    const channels = value.split(/\s+/).map(Number);
    if (channels.length !== 3 || channels.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
      fail(tokensPath, 0, `${name} must be an "R G B" triplet with values 0-255 (found "${value}")`);
    }
    const colorName = name.replace('--color-', '');
    if (!configText.includes(`color('${colorName}')`)) {
      fail(configPath, 0, `token ${name} is not mapped in tailwind.config.js`);
    }
  }

  const validColors = collectColorNames(config.theme?.colors ?? {});
  const files = listFiles(join(root, 'src'));

  for (const file of [...files, configPath]) {
    const text = readFileSync(file, 'utf8');

    // 2. var(--x) references must exist
    for (const match of text.matchAll(/var\(\s*(--[\w-]*\w)(?=[\s,)])/g)) {
      if (!tokens.has(match[1]) && !match[1].startsWith('--tw-')) {
        fail(file, lineOf(text, match.index), `uses ${match[1]}, which is not defined in tokens.css`);
      }
    }

    if (file === configPath || file === tokensPath) continue;

    // 3. no hard-coded colors, no raw palette classes
    for (const match of text.matchAll(HEX)) fail(file, lineOf(text, match.index), `hard-coded color ${match[0]}; use a token`);
    for (const match of text.matchAll(COLOR_FUNCTION)) fail(file, lineOf(text, match.index), `hard-coded color function "${match[0]}"; use a token`);
    for (const match of text.matchAll(RAW_PALETTE_CLASS)) fail(file, lineOf(text, match.index), `raw palette class "${match[0]}"; use a semantic token class`);

    // 4. semantic classes must exist in the theme
    for (const match of text.matchAll(SEMANTIC_CLASS)) {
      if (!validColors.has(match[1])) fail(file, lineOf(text, match.index), `unknown color token class "${match[0]}"`);
    }
  }

  return { failures, stats: { tokens: tokens.size, files: files.length, colorNames: validColors.size } };
}

const isDirectRun = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirectRun) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { failures, stats } = await checkDesignTokens(root);
  if (failures.length > 0) {
    console.error(`Design token check FAILED (${failures.length}):\n - ${failures.join('\n - ')}`);
    process.exit(1);
  }
  console.log(`Design token check passed: ${stats.tokens} tokens, ${stats.colorNames} color names, ${stats.files} source files scanned.`);
}
