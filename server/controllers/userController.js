const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get a user's profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
    try {
        // Find the user by their ID (from the URL)
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Find all posts made by this user
        const posts = await Post.find({ author: user._id })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ user, posts });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id; // From 'protect' middleware

        if (targetUserId === currentUserId) {
            return res.status(400).json({ msg: 'You cannot follow yourself' });
        }

        // Add target user to current user's 'following' list
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: targetUserId } // $addToSet prevents duplicates
        });

        // Add current user to target user's 'followers' list
        await User.findByIdAndUpdate(targetUserId, {
            $addToSet: { followers: currentUserId }
        });

        res.status(200).json({ msg: 'User followed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        // Remove target user from current user's 'following' list
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { following: targetUserId } // $pull removes from array
        });

        // Remove current user from target user's 'followers' list
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUserId }
        });

        res.status(200).json({ msg: 'User unfollowed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};