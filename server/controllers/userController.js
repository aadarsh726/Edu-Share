const User = require('../models/User');
const Post = require('../models/Post');
const { updateUserScore } = require('../utils/scoreUtils');

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

// @desc    Update current user's bio
// @route   PUT /api/users/:id/bio
// @access  Private
exports.updateBio = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId !== currentUserId) {
            return res.status(403).json({ msg: 'You can only edit your own bio' });
        }

        const { bio } = req.body;
        const updated = await User.findByIdAndUpdate(
            currentUserId,
            { $set: { bio: bio ?? '' } },
            { new: true }
        ).select('-password');

        if (!updated) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({ user: updated });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update current user's bio (no path param)
// @route   PUT /api/users/me/bio
// @access  Private
exports.updateMyBio = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { bio } = req.body;
        const updated = await User.findByIdAndUpdate(
            currentUserId,
            { $set: { bio: bio ?? '' } },
            { new: true }
        ).select('-password');
        if (!updated) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({ user: updated });
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

        // Award +3 points to followed user
        await updateUserScore(targetUserId, 3);

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

        // Remove 3 points when unfollowed
        await updateUserScore(targetUserId, -3);

        res.status(200).json({ msg: 'User unfollowed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};