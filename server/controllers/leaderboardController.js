const User = require('../models/User');

// @desc    Get top contributors leaderboard (weekly primary; includes lifetime)
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        // Get top 10 users sorted by weeklyScore (descending)
        // Only return username, weeklyScore, lifetimeScore and _id
        const topUsers = await User.find()
            .select('username score weeklyScore lifetimeScore _id')
            .sort({ weeklyScore: -1 })
            .limit(10);

        // Backward compatibility: expose `score` as weeklyScore
        const leaderboard = topUsers.map(u => ({
            _id: u._id,
            username: u.username,
            weeklyScore: (u.weeklyScore ?? u.score ?? 0),
            lifetimeScore: (u.lifetimeScore ?? u.score ?? 0),
            score: u.weeklyScore ?? u.score ?? 0
        }));

        res.status(200).json({ success: true, leaderboard });

    } catch (err) {
        console.error('Leaderboard error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

