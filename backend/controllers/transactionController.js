/**
 * Transaction Controller
 * Handles all transaction CRUD operations and financial analytics
 */

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

// ==========================================
// GET ALL TRANSACTIONS (with pagination & filters)
// GET /api/transactions
// ==========================================

const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build filter query
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET SINGLE TRANSACTION
// GET /api/transactions/:id
// ==========================================

const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CREATE TRANSACTION
// POST /api/transactions
// ==========================================

const createTransaction = async (req, res, next) => {
  // Use mongoose session for atomic operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { type, amount, description, category, recipientAccount, recipientName, notes } = req.body;
    const parsedAmount = parseFloat(amount);

    // Get current user with latest balance
    const user = await User.findById(req.user._id).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate sufficient balance for debit operations
    const debitTypes = ['debit', 'transfer', 'payment', 'withdrawal'];
    if (debitTypes.includes(type) && user.balance < parsedAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${user.balance.toFixed(2)}`
      });
    }

    // Calculate new balance
    let newBalance = user.balance;
    if (['credit', 'deposit'].includes(type)) {
      newBalance += parsedAmount;
    } else {
      newBalance -= parsedAmount;
    }

    // Update user balance
    user.balance = newBalance;
    await user.save({ session });

    // Create transaction record
    const transaction = await Transaction.create([{
      user: req.user._id,
      type,
      amount: parsedAmount,
      description,
      category: category || 'other',
      balanceAfter: newBalance,
      recipientAccount: recipientAccount || '',
      recipientName: recipientName || '',
      notes: notes || '',
      transactionDate: new Date(),
      status: 'completed',
      ipAddress: req.ip
    }], { session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      data: {
        transaction: transaction[0],
        newBalance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ==========================================
// UPDATE TRANSACTION (Notes & Tags only)
// PUT /api/transactions/:id
// ==========================================

const updateTransaction = async (req, res, next) => {
  try {
    const { notes, tags, description } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Only allow updating metadata fields (not financial data)
    if (notes !== undefined) transaction.notes = notes;
    if (tags !== undefined) transaction.tags = tags;
    if (description !== undefined) transaction.description = description;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE TRANSACTION
// DELETE /api/transactions/:id
// ==========================================

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET DASHBOARD STATS
// GET /api/transactions/stats/dashboard
// ==========================================

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user current balance
    const user = await User.findById(userId);

    // Run all aggregations in parallel for performance
    const [summary, monthlyData, categoryData, recentTransactions] = await Promise.all([
      Transaction.getUserSummary(userId),
      Transaction.getMonthlySpending(userId),
      Transaction.getCategoryBreakdown(userId),
      Transaction.find({ user: userId })
        .sort('-createdAt')
        .limit(5)
        .lean()
    ]);

    // Calculate totals from summary
    let totalIncome = 0;
    let totalExpenses = 0;

    summary.forEach(item => {
      if (['credit', 'deposit'].includes(item._id)) {
        totalIncome += item.totalAmount;
      } else {
        totalExpenses += item.totalAmount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        balance: user.balance,
        currency: user.currency,
        totalIncome,
        totalExpenses,
        savingsRate: totalIncome > 0
          ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
          : 0,
        transactionSummary: summary,
        monthlySpending: monthlyData,
        categoryBreakdown: categoryData,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardStats
};
