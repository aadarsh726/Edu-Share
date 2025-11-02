const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// @route   GET /api/leaderboard
// @desc    Get top 10 contributors leaderboard
// @access  Public
router.get('/', getLeaderboard);

module.exports = router;

