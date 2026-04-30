/**
 * Chatbot Controller
 * Handles AI chatbot interactions
 */

const axios = require('axios');

// @desc    Send message to AI chatbot
// @route   POST /api/chatbot/chat
// @access  Private
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // For now, we'll use a simple mock response
    // In a real implementation, this would call an AI service like OpenAI, Azure AI, etc.
    const responses = [
      "Hello! I'm your AI banking assistant. How can I help you today?",
      "I can help you with account information, transaction history, or general banking questions.",
      "For security reasons, please don't share sensitive information like passwords or PINs.",
      "Would you like me to explain any banking terms or help with a specific transaction?",
      "I'm here to assist with your banking needs. What would you like to know?",
      "If you have questions about your account balance or recent transactions, I can guide you through our system.",
      "For complex banking issues, I recommend contacting our customer support team.",
      "Remember, all transactions are monitored for fraud protection using our advanced AI system."
    ];

    // Simple keyword-based responses
    let response = responses[Math.floor(Math.random() * responses.length)];

    if (message.toLowerCase().includes('balance')) {
      response = "To check your account balance, please visit the Dashboard page where you can see your current balance and recent transactions.";
    } else if (message.toLowerCase().includes('transaction')) {
      response = "You can view all your transactions on the Transactions page. Our AI fraud detection system automatically analyzes each transaction for security.";
    } else if (message.toLowerCase().includes('fraud') || message.toLowerCase().includes('security')) {
      response = "Our advanced AI fraud detection system monitors all transactions in real-time. If any suspicious activity is detected, you'll be notified immediately.";
    } else if (message.toLowerCase().includes('help')) {
      response = "I can help you with:\n• Account information\n• Transaction history\n• Banking terms\n• Security features\n• General banking questions\n\nWhat would you like to know about?";
    }

    res.status(200).json({
      success: true,
      data: {
        response: response,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while processing your message'
    });
  }
};

module.exports = {
  chat
};