/**
 * User Controller
 * Handles user profile management operations
 */

const User = require('../models/User');

// ==========================================
// GET USER PROFILE
// GET /api/users/profile
// ==========================================

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE USER PROFILE
// PUT /api/users/profile
// ==========================================

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, dateOfBirth } = req.body;

    // Fields that are allowed to be updated
    const allowedUpdates = {};
    if (firstName) allowedUpdates.firstName = firstName;
    if (lastName) allowedUpdates.lastName = lastName;
    if (phone) allowedUpdates.phone = phone;
    if (address) allowedUpdates.address = address;
    if (dateOfBirth) allowedUpdates.dateOfBirth = dateOfBirth;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET ALL USERS (Admin only)
// GET /api/users
// ==========================================

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find({}).skip(skip).limit(parseInt(limit)).sort('-createdAt'),
      User.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DEACTIVATE ACCOUNT
// DELETE /api/users/profile
// ==========================================

const deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, deactivateAccount };
