const express = require('express');
const {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  tokenParamValidation,
} = require('../middlewares/validate');
const { sensitiveEndpointLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', registerValidation, register);
router.get('/verify/:token', tokenParamValidation, verifyEmail);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', sensitiveEndpointLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', sensitiveEndpointLimiter, tokenParamValidation, resetPasswordValidation, resetPassword);

module.exports = router;
