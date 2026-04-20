/**
 * Authentication Controller
 * Handles user registration, login, logout, and profile operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ==========================================
// HELPER: Generate JWT Token
// ==========================================

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Helper: Build user response object (exclude sensitive data)
const buildUserResponse = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  accountNumber: user.accountNumber,
  accountType: user.accountType,
  balance: user.balance,
  currency: user.currency,
  isActive: user.isActive,
  isVerified: user.isVerified,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt
});

// ==========================================
// REGISTER USER
// POST /api/auth/register
// ==========================================

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, accountType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create new user (password is hashed in pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      accountType: accountType || 'savings',
      balance: 10000.00 // Welcome bonus balance
    });

    // Create a welcome credit transaction
    await Transaction.create({
      user: user._id,
      type: 'credit',
      amount: 10000.00,
      description: 'Welcome Bonus - Account Opening Credit',
      category: 'other',
      balanceAfter: 10000.00,
      status: 'completed'
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Smart Banking.',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LOGIN USER
// POST /api/auth/login
// ==========================================

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password (select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(401).json({
        success: false,
        message: `Account temporarily locked. Try again in ${lockTime} minutes.`
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET CURRENT USER PROFILE
// GET /api/auth/me
// ==========================================

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: buildUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE PASSWORD
// PUT /api/auth/password
// ==========================================

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isValid = await user.matchPassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePassword };
