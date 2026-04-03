const requiredEnvVars = [
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'CLIENT_URL',
];

const optionalEnvVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
];

const validateEnv = () => {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.map((v) => `  - ${v}`).join('\n')}`
    );
  }

  const missingOptional = optionalEnvVars.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `⚠ Email not configured (missing: ${missingOptional.join(', ')}). Emails will be skipped and links logged to console.`
    );
  }
};

/** @returns {boolean} true if all SMTP env vars are set */
const isEmailConfigured = () => optionalEnvVars.every((key) => process.env[key]);

module.exports = { validateEnv, isEmailConfigured };
