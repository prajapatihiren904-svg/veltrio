import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../../src/utils/ApiError.js';
import { asyncHandler } from '../../src/utils/asyncHandler.js';
import { sendSuccess } from '../../src/utils/apiResponse.js';
import { DB_STATES, resolveDbState } from '../../src/constants/dbStates.js';

test('ApiError factories set the expected status codes', () => {
  assert.equal(ApiError.badRequest().statusCode, 400);
  assert.equal(ApiError.unauthorized().statusCode, 401);
  assert.equal(ApiError.forbidden().statusCode, 403);
  assert.equal(ApiError.notFound().statusCode, 404);
  assert.equal(ApiError.conflict().statusCode, 409);
  const error = new ApiError(422, 'Nope', [{ field: 'x' }]);
  assert.equal(error.isOperational, true);
  assert.ok(error instanceof Error);
  assert.deepEqual(error.errors, [{ field: 'x' }]);
});

test('asyncHandler forwards rejections to next()', async () => {
  const failure = new Error('async failure');
  let forwarded;
  const handler = asyncHandler(async () => {
    throw failure;
  });
  handler({}, {}, (err) => {
    forwarded = err;
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(forwarded, failure);
});

test('asyncHandler does not call next() on success', async () => {
  let nextCalled = false;
  asyncHandler(async () => {})({}, {}, () => {
    nextCalled = true;
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(nextCalled, false);
});

test('sendSuccess builds the standard envelope', () => {
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  sendSuccess(res, { data: { a: 1 }, message: 'Done', statusCode: 201 });
  assert.equal(res.code, 201);
  assert.deepEqual(res.body, { success: true, message: 'Done', data: { a: 1 } });

  sendSuccess(res);
  assert.deepEqual(res.body, { success: true, data: null });
});

test('resolveDbState maps readyState values', () => {
  assert.equal(DB_STATES.length, 4);
  assert.equal(resolveDbState(0), 'disconnected');
  assert.equal(resolveDbState(1), 'connected');
  assert.equal(resolveDbState(99), 'unknown');
});
