const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * @param {string} userId - MongoDB ObjectId
 * @param {number} tokenVersion - current user token version for revocation checks
 * @returns {string} JWT access token (short-lived)
 */
const generateAccessToken = (userId, tokenVersion = 0) => {
  return jwt.sign({ userId, tokenVersion }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  });
};

/**
 * @param {string} userId - MongoDB ObjectId
 * @param {number} tokenVersion - current user token version for revocation checks
 * @returns {string} JWT refresh token (long-lived, stored in httpOnly cookie)
 */
const generateRefreshToken = (userId, tokenVersion = 0) => {
  return jwt.sign({ userId, tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  });
};

/**
 * Generates a cryptographically secure random hex token
 * Used for email verification and password reset flows
 * @returns {string} 64-character hex string
 */
const generateCryptoToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { generateAccessToken, generateRefreshToken, generateCryptoToken };
