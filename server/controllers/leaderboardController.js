const User = require('../models/User');

// @desc    Get top contributors leaderboard
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        // Get top 10 users sorted by score (descending)
        // Only return username, score, and _id for privacy
        const topUsers = await User.find()
            .select('username score _id') // Only select necessary fields
            .sort({ score: -1 }) // Sort by score descending
            .limit(10); // Limit to top 10

        res.status(200).json({
            success: true,
            leaderboard: topUsers
        });

    } catch (err) {
        console.error('Leaderboard error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

