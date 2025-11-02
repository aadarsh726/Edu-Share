const express = require('express');
const router = express.Router();
const { getUserProfile, followUser, unfollowUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Our "security guard"

// Get a user's profile and their posts
router.get('/:id', getUserProfile);

// Follow a user
router.post('/:id/follow', protect, followUser);

// Unfollow a user
router.post('/:id/unfollow', protect, unfollowUser);

module.exports = router;