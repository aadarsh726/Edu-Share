const express = require('express');
const router = express.Router();
const { getUserProfile, followUser, unfollowUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Our "security guard"

// (bio routes removed per request)

// Follow a user
router.post('/:id/follow', protect, followUser);

// Unfollow a user
router.post('/:id/unfollow', protect, unfollowUser);

// Get a user's profile and their posts
router.get('/:id', getUserProfile);

module.exports = router;