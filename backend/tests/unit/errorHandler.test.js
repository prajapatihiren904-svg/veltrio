import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createErrorHandler, normalizeError, notFound } from '../../src/middleware/errorHandler.js';
import { ApiError } from '../../src/utils/ApiError.js';

const silentLogger = { error() {} };

function run(handlerOptions, error) {
  const handler = createErrorHandler({ logger: silentLogger, ...handlerOptions });
  const res = {
    headersSent: false,
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  handler(error, {}, res, () => {});
  return res;
}

test('ApiError keeps its status, message and errors', () => {
  const res = run({}, ApiError.badRequest('Bad input', [{ field: 'email', message: 'Invalid' }]));
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Bad input',
    errors: [{ field: 'email', message: 'Invalid' }],
  });
});

test('notFound forwards a 404 ApiError naming the route', () => {
  let forwarded;
  notFound({ method: 'GET', originalUrl: '/api/v1/nope' }, {}, (err) => {
    forwarded = err;
  });
  assert.equal(forwarded.statusCode, 404);
  assert.match(forwarded.message, /GET \/api\/v1\/nope/);
});

test('maps malformed JSON and oversized bodies', () => {
  assert.equal(normalizeError({ type: 'entity.parse.failed', statusCode: 400 }).message, 'Invalid JSON in request body');
  assert.equal(normalizeError({ type: 'entity.too.large', statusCode: 413 }).statusCode, 413);
});

test('maps Mongoose validation errors to a field list', () => {
  const error = {
    name: 'ValidationError',
    errors: { amount: { path: 'amount', message: 'Amount must be positive' } },
  };
  const result = normalizeError(error);
  assert.equal(result.statusCode, 400);
  assert.deepEqual(result.errors, [{ field: 'amount', message: 'Amount must be positive' }]);
});

test('maps CastError, duplicate key and JWT errors', () => {
  assert.equal(normalizeError({ name: 'CastError', path: '_id' }).statusCode, 400);
  const duplicate = normalizeError({ code: 11000, keyValue: { email: 'a@b.c' } });
  assert.equal(duplicate.statusCode, 409);
  assert.match(duplicate.message, /email/);
  assert.equal(normalizeError({ name: 'TokenExpiredError' }).statusCode, 401);
  assert.equal(normalizeError({ name: 'JsonWebTokenError' }).statusCode, 401);
});

test('unexpected errors show details in development', () => {
  const res = run({ isProduction: false }, new Error('boom'));
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'boom');
  assert.ok(res.body.stack);
});

test('unexpected errors are masked in production', () => {
  const res = run({ isProduction: true }, new Error('database password leaked'));
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Internal server error');
  assert.equal(res.body.stack, undefined);
});

test('operational ApiErrors stay visible in production', () => {
  const res = run({ isProduction: true }, ApiError.notFound('Transaction not found'));
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, 'Transaction not found');
});

test('delegates to Express when headers were already sent', () => {
  const handler = createErrorHandler({ logger: silentLogger });
  let forwarded = null;
  handler(new Error('late'), {}, { headersSent: true }, (err) => {
    forwarded = err;
  });
  assert.equal(forwarded.message, 'late');
});
