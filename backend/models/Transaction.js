/**
 * Transaction Model - MongoDB Schema using Mongoose
 * Defines the structure for financial transaction documents
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this transaction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user']
    },

    // Transaction Type
    type: {
      type: String,
      enum: ['credit', 'debit', 'transfer', 'payment', 'withdrawal', 'deposit'],
      required: [true, 'Transaction type is required']
    },

    // Financial Details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Balance after transaction is required']
    },

    // Transaction Details
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: [
        'salary',
        'food',
        'shopping',
        'utilities',
        'entertainment',
        'healthcare',
        'education',
        'travel',
        'transfer',
        'investment',
        'other'
      ],
      default: 'other'
    },

    // Reference & Tracking
    referenceNumber: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },

    // Transfer specific fields
    recipientAccount: {
      type: String,
      trim: true
    },
    recipientName: {
      type: String,
      trim: true
    },
    senderAccount: {
      type: String,
      trim: true
    },

    // Metadata
    ipAddress: {
      type: String
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    tags: [{
      type: String,
      trim: true
    }],

    // Date of transaction (can differ from createdAt)
    transactionDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// MIDDLEWARE
// ==========================================

// Auto-generate unique reference number before saving
transactionSchema.pre('save', function (next) {
  if (this.isNew && !this.referenceNumber) {
    // Format: TXN + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.referenceNumber = `TXN${timestamp}${random}`;
  }
  next();
});

// ==========================================
// STATIC METHODS (Aggregation Pipelines)
// ==========================================

// Get transaction summary for a user (aggregation pipeline)
transactionSchema.statics.getUserSummary = async function (userId) {
  const result = await this.aggregate([
    // Stage 1: Match transactions for the user
    { $match: { user: new mongoose.Types.ObjectId(userId) } },

    // Stage 2: Group by transaction type
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },

    // Stage 3: Sort by totalAmount descending
    { $sort: { totalAmount: -1 } }
  ]);

  return result;
};

// Get monthly spending summary
transactionSchema.statics.getMonthlySpending = async function (userId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        transactionDate: { $gte: sixMonthsAgo },
        type: { $in: ['debit', 'payment', 'withdrawal'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' }
        },
        totalSpent: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return result;
};

// Get category-wise spending
transactionSchema.statics.getCategoryBreakdown = async function (userId) {
  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: { $in: ['debit', 'payment', 'withdrawal'] }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  return result;
};

// ==========================================
// INDEXES for Performance
// ==========================================

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, transactionDate: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
