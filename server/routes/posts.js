const express = require('express');
const router = express.Router();
const { createPost, getAllPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); // Our "security guard"

// @route   POST /api/posts
// @desc    Create a new post
router.post('/', protect, createPost);

// @route   GET /api/posts
// @desc    Get all posts
router.get('/', getAllPosts);

module.exports = router;