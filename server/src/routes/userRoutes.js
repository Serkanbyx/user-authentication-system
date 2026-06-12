const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const protect = require('../middlewares/auth');
const {
  updateProfileValidation,
  changePasswordValidation,
} = require('../middlewares/validate');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     description: Returns the authenticated user's profile data including verification status and timestamps.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Updates the user's name and/or email. If the email changes, the new address is stored as a pending email and a verification link is sent to it; the current email stays active until the new one is verified.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       description: The active email — unchanged until the new one is verified
 *                     pendingEmail:
 *                       type: string
 *                       nullable: true
 *                       description: A new email awaiting verification, if an email change was requested
 *                     isVerified:
 *                       type: boolean
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email is already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.route('/profile')
  .get(getProfile)
  .put(updateProfileValidation, updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change password
 *     description: Verifies the current password and sets a new one. After success the refresh cookie is cleared, requiring a fresh login.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed — user must log in again
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       401:
 *         description: Not authenticated or current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.put('/change-password', changePasswordValidation, changePassword);

module.exports = router;
