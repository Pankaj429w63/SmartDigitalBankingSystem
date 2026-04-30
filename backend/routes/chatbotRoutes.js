/**
 * Chatbot Routes
 * Base path: /api/chatbot
 */

const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/chatbot/chat
// @desc    Send a message to the AI chatbot
// @access  Private
router.post('/chat', protect, chat);

module.exports = router;