const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('./AppError');

/**
 * Protects routes by verifying JWT access token from Authorization header.
 * Attaches authenticated user to req.user on success.
 */
const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AppError('Session expired. Please login again.', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email to access this resource.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please login again.', 401));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please login again.', 401));
    }

    next(new AppError('Authentication failed.', 401));
  }
};

module.exports = protect;
