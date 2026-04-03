const User = require("../models/User");
const AppError = require("../middlewares/AppError");
const { generateCryptoToken } = require("../utils/tokenUtils");
const {
  sendEmail,
  verificationEmailTemplate,
} = require("../utils/sendEmail");

/**
 * @route   GET /api/users/profile
 * @desc    Return authenticated user's profile data
 * @access  Private
 */
const getProfile = async (req, res) => {
  const { _id, name, email, isVerified, createdAt, updatedAt } = req.user;

  res.status(200).json({
    success: true,
    user: { id: _id, name, email, isVerified, createdAt, updatedAt },
  });
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update user name and/or email. Re-verifies if email changes.
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isEmailChanging = email && email !== user.email;

    if (isEmailChanging) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        throw new AppError("Email is already in use", 409);
      }
    }

    if (name) user.name = name;

    if (isEmailChanging) {
      user.email = email;
      user.isVerified = false;
      user.verifyToken = generateCryptoToken();
      user.verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

      const emailHtml = verificationEmailTemplate(user.name, user.verifyToken);
      await sendEmail({
        to: user.email,
        subject: "Verify your new email address",
        html: emailHtml,
      });
    }

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: isEmailChanging
        ? "Profile updated. Please verify your new email address."
        : "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/change-password
 * @desc    Verify current password, then hash and save the new one
 * @access  Private
 */
const REFRESH_COOKIE_NAME = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    user.password = newPassword;
    await user.save();

    res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
