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

// All user routes require authentication
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfileValidation, updateProfile);

router.put('/change-password', changePasswordValidation, changePassword);

module.exports = router;
