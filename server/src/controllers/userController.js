const User = require("../models/User");
const AppError = require("../middlewares/AppError");
const { generateCryptoToken } = require("../utils/tokenUtils");
const {
  sendEmail,
  verificationEmailTemplate,
} = require("../utils/sendEmail");
const { REFRESH_COOKIE_NAME, getRefreshCookieOptions } = require("../utils/cookieOptions");

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
      // Keep the current email active; the new one only takes effect once the
      // user verifies it, so they are never locked out of their account.
      user.pendingEmail = email;
      const verifyToken = generateCryptoToken();
      user.verifyToken = verifyToken;
      user.verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

      const emailHtml = verificationEmailTemplate(user.name, verifyToken);

      try {
        await sendEmail({
          to: email,
          subject: "Verify your new email address",
          html: emailHtml,
        });
      } catch {
        throw new AppError("Unable to send verification email. Email was not updated.", 503);
      }
    }

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: isEmailChanging
        ? "Profile updated. Check your new inbox to confirm the email change."
        : "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pendingEmail: user.pendingEmail,
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
    // Invalidate the current access token and refresh cookie immediately so
    // the password change forces a fresh login everywhere.
    user.tokenVersion += 1;
    await user.save();

    res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());

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
