/**
 * User Routes
 * Base path: /api/users
 */

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers, deactivateAccount } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// @route   GET /api/users/profile
// @route   PUT /api/users/profile
// @route   DELETE /api/users/profile
// @access  Private
router
  .route('/profile')
  .get(getProfile)
  .put(updateProfile)
  .delete(deactivateAccount);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', adminOnly, getAllUsers);

module.exports = router;
