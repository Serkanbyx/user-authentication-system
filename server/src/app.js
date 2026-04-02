const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { globalLimiter, authLimiter } = require('./middlewares/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — whitelist frontend origin with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Cookie parser for httpOnly cookies
app.use(cookieParser());

// Global rate limiter — 100 req / 15 min
app.use(globalLimiter);

// Routes (auth routes have stricter rate limiter — 10 req / 15 min)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
