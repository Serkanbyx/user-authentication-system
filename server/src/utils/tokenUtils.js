const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * @param {string} userId - MongoDB ObjectId
 * @returns {string} JWT access token (short-lived)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  });
};

/**
 * @param {string} userId - MongoDB ObjectId
 * @returns {string} JWT refresh token (long-lived, stored in httpOnly cookie)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
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
