const AppError = require('./AppError');

const handleMongooseValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(messages.join('. '), 400);
};

const handleMongooseDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} is already in use`, 409);
};

const handleMongooseCastError = (err) => {
  return new AppError(`Invalid value for ${err.path}: ${err.value}`, 400);
};

const handleJwtError = () => {
  return new AppError('Invalid token. Please log in again', 401);
};

const handleJwtExpiredError = () => {
  return new AppError('Token has expired. Please log in again', 401);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }

  if (err.code === 11000) {
    error = handleMongooseDuplicateKeyError(err);
  }

  if (err.name === 'CastError') {
    error = handleMongooseCastError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJwtError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJwtExpiredError();
  }

  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: error.stack }),
  });
};

module.exports = errorHandler;
