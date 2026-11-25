import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeInput, sanitizeValue } from '../../src/middleware/sanitize.js';

test('removes MongoDB operators and dotted keys at any depth', () => {
  const input = { email: { $gt: '' }, nested: { ok: 1, 'a.b': 2, deeper: { $where: 'x', keep: true } } };
  assert.deepEqual(sanitizeValue(input), { email: {}, nested: { ok: 1, deeper: { keep: true } } });
});

test('cleans objects inside arrays', () => {
  assert.deepEqual(sanitizeValue([{ $ne: 1, a: 1 }, 'text', 5]), [{ a: 1 }, 'text', 5]);
});

test('strips prototype-pollution keys from parsed JSON', () => {
  const parsed = JSON.parse('{"__proto__":{"admin":true},"constructor":{"x":1},"name":"ok"}');
  assert.deepEqual(sanitizeValue(parsed), { name: 'ok' });
  assert.equal({}.admin, undefined);
});

test('middleware sanitizes body, query and params then continues', () => {
  const req = { body: { $or: [] }, query: { 'x.y': '1', page: '2' }, params: { id: '5' } };
  let called = false;
  sanitizeInput(req, {}, () => {
    called = true;
  });
  assert.ok(called);
  assert.deepEqual(req.body, {});
  assert.deepEqual(req.query, { page: '2' });
  assert.deepEqual(req.params, { id: '5' });
});

test('tolerates missing body, query and params', () => {
  assert.doesNotThrow(() => sanitizeInput({}, {}, () => {}));
});
