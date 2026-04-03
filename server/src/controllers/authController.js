const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../middlewares/AppError");
const {
  generateAccessToken,
  generateRefreshToken,
  generateCryptoToken,
} = require("../utils/tokenUtils");
const {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
} = require("../utils/sendEmail");

const REFRESH_COOKIE_NAME = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send verification email
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email is already in use", 409);
    }

    const verifyToken = generateCryptoToken();
    const verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password,
      verifyToken,
      verifyTokenExpire,
    });

    const emailHtml = verificationEmailTemplate(user.name, verifyToken);
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: emailHtml,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/verify/:token
 * @desc    Verify user email with token
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpire: { $gt: Date.now() },
    }).select("+verifyToken +verifyTokenExpire");

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, return access token and set refresh cookie
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email before logging in", 403);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using httpOnly refresh cookie
 * @access  Public (requires valid refresh cookie)
 */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new AppError("No refresh token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired refresh token", 401));
    }
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Clear refresh token cookie
 * @access  Public
 */
const logout = (_req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token and send email
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordExpire"
    );

    if (user) {
      const resetToken = generateCryptoToken();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
      await user.save({ validateModifiedOnly: true });

      const emailHtml = resetPasswordEmailTemplate(user.name, resetToken);
      await sendEmail({
        to: user.email,
        subject: "Password reset request",
        html: emailHtml,
      });
    }

    // Always respond the same way to prevent email enumeration
    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
