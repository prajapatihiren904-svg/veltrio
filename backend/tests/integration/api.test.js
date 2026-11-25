/**
 * HTTP integration tests. They need the backend dependencies (npm install) but NOT a
 * database: the app is started without connecting to MongoDB, so /health reports "degraded".
 * If dependencies are not installed, the suite is skipped with a clear reason.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI ??= 'mongodb+srv://user:pass@cluster0.abcde.mongodb.net/veltrio';
process.env.JWT_SECRET ??= 'z'.repeat(48);
process.env.CLIENT_URL = 'http://localhost:5173';

let createApp = null;
let skipReason = null;
try {
  ({ createApp } = await import('../../src/app.js'));
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && /Cannot find package/.test(error.message)) {
    skipReason = `dependencies not installed (${error.message.split("'")[1]}). Run "npm install" in backend/.`;
  } else {
    throw error;
  }
}

if (skipReason) {
  test('API integration suite', { skip: skipReason }, () => {});
} else {
  let server;
  let baseUrl;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /api/v1/health returns the standard envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.database, 'disconnected');
    assert.equal(body.data.status, 'degraded');
    assert.equal(typeof body.data.uptime, 'number');
  });

  test('unknown routes return the JSON 404 shape', async () => {
    const res = await fetch(`${baseUrl}/api/v1/does-not-exist`);
    const body = await res.json();
    assert.equal(res.status, 404);
    assert.equal(body.success, false);
    assert.match(body.message, /Route not found/);
  });

  test('malformed JSON returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not json',
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).message, 'Invalid JSON in request body');
  });

  test('security headers are set by helmet', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  test('CORS allows the configured origin and rejects others', async () => {
    const allowed = await fetch(`${baseUrl}/api/v1/health`, { headers: { Origin: 'http://localhost:5173' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');

    const blocked = await fetch(`${baseUrl}/api/v1/health`, { headers: { Origin: 'http://evil.example' } });
    assert.equal(blocked.status, 403);
  });

  test('private auth session endpoint rejects requests without a bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
  });

  test('private dashboard summary rejects requests without a bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/dashboard/summary`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
  });

  test('private transaction list rejects requests without a bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/transactions`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
  });

  test('private category creation rejects requests without a bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/transactions/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test category', type: 'expense' }),
    });
    assert.equal(res.status, 401);
    assert.equal((await res.json()).success, false);
  });

  test('registration validates required fields before touching the database', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short', role: 'admin' }),
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.success, false);
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.length >= 2);
  });

  test('forgot-password validates the email before database access', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.success, false);
  });

}
