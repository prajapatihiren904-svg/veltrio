/**
 * Environment configuration.
 *
 * Every variable is read and validated in ONE place. The server refuses to
 * start with a clear message when something is missing or still holds a
 * placeholder from .env.example, so misconfiguration never reaches runtime.
 *
 * In development the variables are loaded by Node itself
 * (`node --env-file=.env`, see the "dev" script). In production they are
 * injected by the hosting platform.
 */

const ENVIRONMENTS = ['development', 'test', 'production'];
const PLACEHOLDER_MARKERS = ['USERNAME:PASSWORD', 'replace_with', 'CLUSTER.mongodb.net'];

export class EnvError extends Error {
  constructor(problems) {
    super(`Invalid environment configuration:\n - ${problems.join('\n - ')}`);
    this.name = 'EnvError';
    this.problems = problems;
  }
}

const hasPlaceholder = (value) => PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));

const parseIntegerInRange = (raw, fallback, min, max) => {
  const value = raw === undefined || raw === '' ? fallback : Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
};

/**
 * Pure validation function (exported so it can be unit tested).
 * @param {Record<string, string | undefined>} source
 */
export function validateEnv(source = process.env) {
  const problems = [];

  const nodeEnv = (source.NODE_ENV || 'development').trim();
  if (!ENVIRONMENTS.includes(nodeEnv)) {
    problems.push(`NODE_ENV must be one of: ${ENVIRONMENTS.join(', ')}`);
  }

  const port = parseIntegerInRange(source.PORT, 5000, 1, 65535);
  if (port === null) problems.push('PORT must be an integer between 1 and 65535');

  const mongoUri = (source.MONGO_URI || '').trim();
  if (!mongoUri) {
    problems.push('MONGO_URI is required (your MongoDB Atlas connection string)');
  } else if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    problems.push('MONGO_URI must start with mongodb:// or mongodb+srv://');
  } else if (hasPlaceholder(mongoUri)) {
    problems.push('MONGO_URI still contains the placeholder values from .env.example');
  }

  const jwtSecret = (source.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    problems.push('JWT_SECRET is required');
  } else if (jwtSecret.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters long');
  } else if (hasPlaceholder(jwtSecret)) {
    problems.push('JWT_SECRET still contains the placeholder value from .env.example');
  }

  const bcryptSaltRounds = parseIntegerInRange(source.BCRYPT_SALT_ROUNDS, 12, 10, 15);
  if (bcryptSaltRounds === null) problems.push('BCRYPT_SALT_ROUNDS must be an integer between 10 and 15');

  const smtpHost = (source.SMTP_HOST || '').trim();
  const smtpUser = (source.SMTP_USER || '').trim();
  const smtpPass = (source.SMTP_PASS || '').trim();
  const smtpPort = parseIntegerInRange(source.SMTP_PORT, 587, 1, 65535);
  if (smtpPort === null) problems.push('SMTP_PORT must be an integer between 1 and 65535');
  const smtpConfigured = Boolean(smtpHost || smtpUser || smtpPass);
  if (smtpConfigured && !(smtpHost && smtpUser && smtpPass)) {
    problems.push('SMTP_HOST, SMTP_USER and SMTP_PASS must all be set together, or all left blank');
  }
  const emailFrom = (source.EMAIL_FROM || 'VELTRIO <no-reply@veltrio.app>').trim();
  const resendApiKey = (source.RESEND_API_KEY || '').trim();

  const clientOrigins = (source.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  for (const origin of clientOrigins) {
    try {
      new URL(origin);
    } catch {
      problems.push(`CLIENT_URL contains an invalid URL: "${origin}"`);
    }
  }

  if (problems.length > 0) throw new EnvError(problems);

  return Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    isTest: nodeEnv === 'test',
    port,
    mongoUri,
    jwtSecret,
    jwtExpiresIn: (source.JWT_EXPIRES_IN || '7d').trim(),
    bcryptSaltRounds,
    clientOrigins,
    smtpHost: smtpConfigured ? smtpHost : '',
    smtpPort,
    smtpUser,
    smtpPass,
    emailFrom,
    resendApiKey,
  });
}

function loadEnv() {
  try {
    return validateEnv(process.env);
  } catch (error) {
    if (!(error instanceof EnvError)) throw error;
    console.error(`\n${error.message}\n\nCopy backend/.env.example to backend/.env and fill in real values.\n`);
    process.exit(1);
  }
}

export const env = loadEnv();
