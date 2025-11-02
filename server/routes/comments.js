const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/comments/:postId
// @desc    Add a comment to a post
// @access  Private (requires token)
router.post('/:postId', protect, addComment);

// @route   GET /api/comments/:postId
// @desc    Get all comments for a post
// @access  Public
router.get('/:postId', getComments);

module.exports = router;

