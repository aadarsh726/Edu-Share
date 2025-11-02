const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/chatbot
// @desc    Send message to AI chatbot
// @access  Private (requires token)
router.post('/', protect, chatWithAI);

module.exports = router;

