// env.js validates process.env when it is imported, so seed valid values first and
// import it dynamically (static imports would be hoisted above these assignments).
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.MONGO_URI ??= 'mongodb+srv://user:pass@cluster0.abcde.mongodb.net/veltrio';
process.env.JWT_SECRET ??= 'y'.repeat(48);

const { validateEnv, EnvError } = await import('../../src/config/env.js');
const valid = {
  NODE_ENV: 'test',
  MONGO_URI: 'mongodb+srv://user:pass@cluster0.abcde.mongodb.net/veltrio?retryWrites=true',
  JWT_SECRET: 'x'.repeat(48),
};

test('accepts a valid configuration and applies defaults', () => {
  const env = validateEnv(valid);
  assert.equal(env.port, 5000);
  assert.equal(env.bcryptSaltRounds, 12);
  assert.equal(env.jwtExpiresIn, '7d');
  assert.deepEqual(env.clientOrigins, ['http://localhost:5173']);
  assert.equal(env.isTest, true);
  assert.equal(Object.isFrozen(env), true);
});

test('reports every missing required variable at once', () => {
  assert.throws(
    () => validateEnv({}),
    (error) => {
      assert.ok(error instanceof EnvError);
      assert.ok(error.problems.some((p) => p.includes('MONGO_URI')));
      assert.ok(error.problems.some((p) => p.includes('JWT_SECRET')));
      return true;
    }
  );
});

test('rejects placeholder values copied from .env.example', () => {
  assert.throws(
    () => validateEnv({ ...valid, MONGO_URI: 'mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/veltrio' }),
    /placeholder/
  );
  assert.throws(
    () => validateEnv({ ...valid, JWT_SECRET: 'replace_with_a_long_random_string' }),
    /placeholder/
  );
});

test('rejects a short JWT secret and a non-mongodb URI', () => {
  assert.throws(() => validateEnv({ ...valid, JWT_SECRET: 'short' }), /at least 32/);
  assert.throws(() => validateEnv({ ...valid, MONGO_URI: 'postgres://x' }), /mongodb/);
});

test('validates PORT, NODE_ENV and BCRYPT_SALT_ROUNDS', () => {
  assert.throws(() => validateEnv({ ...valid, PORT: '99999' }), /PORT/);
  assert.throws(() => validateEnv({ ...valid, PORT: 'abc' }), /PORT/);
  assert.throws(() => validateEnv({ ...valid, NODE_ENV: 'staging' }), /NODE_ENV/);
  assert.throws(() => validateEnv({ ...valid, BCRYPT_SALT_ROUNDS: '4' }), /BCRYPT_SALT_ROUNDS/);
});

test('parses several CLIENT_URL origins and strips trailing slashes', () => {
  const env = validateEnv({ ...valid, CLIENT_URL: 'https://a.example.com/, http://localhost:5173' });
  assert.deepEqual(env.clientOrigins, ['https://a.example.com', 'http://localhost:5173']);
  assert.throws(() => validateEnv({ ...valid, CLIENT_URL: 'not a url' }), /CLIENT_URL/);
});

test('flags production mode', () => {
  assert.equal(validateEnv({ ...valid, NODE_ENV: 'production' }).isProduction, true);
});


test('SMTP is optional but must be configured as a complete set', () => {
  const development = validateEnv(valid);
  assert.equal(development.smtpHost, '');
  assert.equal(development.smtpPort, 587);
  assert.throws(
    () => validateEnv({ ...valid, SMTP_HOST: 'smtp.example.com', SMTP_USER: 'mailer' }),
    /must all be set together/
  );
  const configured = validateEnv({
    ...valid,
    SMTP_HOST: 'smtp.example.com',
    SMTP_USER: 'mailer',
    SMTP_PASS: 'secret',
    SMTP_PORT: '465',
  });
  assert.equal(configured.smtpPort, 465);
  assert.equal(configured.smtpHost, 'smtp.example.com');
});
