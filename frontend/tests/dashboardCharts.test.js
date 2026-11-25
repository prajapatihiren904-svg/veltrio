import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBreakdownTotal, getMaxMonthlyValue } from '../src/utils/dashboardCharts.js';

test('monthly chart maximum considers both income and expenses and handles empty data', () => {
  assert.equal(getMaxMonthlyValue([{ income: 1200, expense: 800 }, { income: 500, expense: 1500 }]), 1500);
  assert.equal(getMaxMonthlyValue([]), 1);
});

test('expense breakdown total safely sums numeric amounts', () => {
  assert.equal(getBreakdownTotal([{ amount: 10 }, { amount: '2.5' }, { amount: null }]), 12.5);
  assert.equal(getBreakdownTotal([]), 0);
});
