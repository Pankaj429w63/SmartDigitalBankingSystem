/**
 * Transaction Routes
 * Base path: /api/transactions
 */

const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardStats
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { transactionValidation } = require('../middleware/validationMiddleware');

// All transaction routes require authentication
router.use(protect);

// @route   GET /api/transactions/stats/dashboard
// @desc    Get dashboard analytics and statistics (MUST be before /:id)
// @access  Private
router.get('/stats/dashboard', getDashboardStats);

// @route   GET /api/transactions
// @desc    Get all transactions for authenticated user (with pagination/filters)
// @access  Private
//
// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router
  .route('/')
  .get(getTransactions)
  .post(transactionValidation, createTransaction);

// @route   GET /api/transactions/:id
// @desc    Get single transaction by ID
// @access  Private
//
// @route   PUT /api/transactions/:id
// @desc    Update transaction notes/tags
// @access  Private
//
// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router
  .route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
