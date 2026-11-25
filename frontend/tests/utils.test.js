import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../src/utils/cn.js';
import { formatCompactNumber, formatCurrency, formatDate, formatPercent } from '../src/utils/formatters.js';

test('cn joins strings and skips falsy values', () => {
  assert.equal(cn('a', false, null, undefined, '', 'b'), 'a b');
});

test('cn supports arrays and condition objects', () => {
  assert.equal(cn('a', ['b', ['c', false]], { d: true, e: false }), 'a b c d');
  assert.equal(cn(), '');
});

test('formatCurrency formats INR with Indian grouping', () => {
  assert.equal(formatCurrency(1234567.5, 'INR'), '₹12,34,567.50');
  assert.equal(formatCurrency(0), '₹0.00');
});

test('formatCurrency formats other currencies and negatives', () => {
  assert.equal(formatCurrency(1234.5, 'USD'), '$1,234.50');
  assert.match(formatCurrency(-250, 'INR'), /^-₹250\.00$/);
});

test('formatCurrency supports compact notation', () => {
  assert.match(formatCurrency(1500000, 'USD', { compact: true }), /^\$1\.5M$/);
});

test('formatCurrency returns a placeholder for invalid input', () => {
  for (const bad of [null, undefined, '', 'abc', NaN, Infinity]) assert.equal(formatCurrency(bad), '-');
});

test('formatCurrency falls back for an unknown currency code', () => {
  assert.equal(formatCurrency(10, 'NOPE'), 'NOPE 10.00');
});

test('formatPercent and formatCompactNumber', () => {
  assert.equal(formatPercent(72.456, 1), '72.5%');
  assert.equal(formatPercent(50), '50%');
  assert.equal(formatPercent('x'), '-');
  assert.equal(formatCompactNumber(12500, 'en-US'), '12.5K');
  assert.equal(formatCompactNumber('x'), '-');
});

test('formatDate formats valid dates and rejects invalid ones', () => {
  assert.equal(formatDate(new Date(2026, 2, 5)), '5 Mar 2026');
  assert.equal(formatDate('not a date'), '-');
});
