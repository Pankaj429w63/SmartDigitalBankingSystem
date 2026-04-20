/**
 * Validation Middleware
 * Input validation rules using express-validator
 */

const { body, validationResult } = require('express-validator');

/**
 * Run validation and return errors if any
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ==========================================
// AUTH VALIDATION RULES
// ==========================================

const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, lowercase, and number'),

  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),

  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors
];

// ==========================================
// TRANSACTION VALIDATION RULES
// ==========================================

const transactionValidation = [
  body('type')
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['credit', 'debit', 'transfer', 'payment', 'withdrawal', 'deposit'])
    .withMessage('Invalid transaction type'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number greater than 0'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),

  body('category')
    .optional()
    .isIn(['salary', 'food', 'shopping', 'utilities', 'entertainment', 'healthcare', 'education', 'travel', 'transfer', 'investment', 'other'])
    .withMessage('Invalid category'),

  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  transactionValidation,
  handleValidationErrors
};
