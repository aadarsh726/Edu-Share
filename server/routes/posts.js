const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, likePost, unlikePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); // Our "security guard"

// IMPORTANT: More specific routes must come before parameterized routes
// @route   POST /api/posts/:id/like
// @desc    Like a post (add user to likes array)
// @access  Private (requires token)
router.post('/:id/like', protect, likePost);

// @route   POST /api/posts/:id/unlike
// @desc    Unlike a post (remove user from likes array)
// @access  Private (requires token)
router.post('/:id/unlike', protect, unlikePost);

// @route   POST /api/posts
// @desc    Create a new post
router.post('/', protect, createPost);

// @route   GET /api/posts
// @desc    Get all posts
router.get('/', getAllPosts);

module.exports = router;