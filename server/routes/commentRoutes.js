const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { likeComment, unlikeComment } = require('../controllers/commentLikeController');
const { protect } = require('../middleware/authMiddleware');
const { updateUserScore } = require('../utils/scoreUtils');

// IMPORTANT: More specific routes must come before parameterized routes
// @route   POST /api/comments/:postId/like
// @desc    Like a comment (add user to comment's likes array)
// @access  Private (requires token)
router.post('/:postId/like', protect, likeComment);

// @route   POST /api/comments/:postId/unlike
// @desc    Unlike a comment (remove user from comment's likes array)
// @access  Private (requires token)
router.post('/:postId/unlike', protect, unlikeComment);

// @route   POST /api/comments/:postId
// @desc    Add a comment to a post
// @access  Public (can be changed to protected later)
router.post('/:postId', async (req, res) => {
    try {
        console.log('POST /api/comments/:postId hit');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        const { text, username } = req.body;
        const { postId } = req.params;

        // Validate input
        if (!text || !username) {
            return res.status(400).json({ msg: 'Text and username are required' });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Initialize comments array if it doesn't exist (for old posts)
        if (!post.comments) {
            post.comments = [];
        }

        // Create new comment object with empty likes array
        const newComment = {
            text,
            username,
            createdAt: new Date(),
            likes: [] // Initialize empty likes array
        };

        // Push comment to post's comments array
        post.comments.push(newComment);

        // Save the post
        const updatedPost = await post.save();

        // Populate author before sending response
        await updatedPost.populate('author', 'username');

        // Award +2 points to post author for receiving a comment
        await updateUserScore(post.author._id || post.author, 2);

        res.status(200).json(updatedPost);

    } catch (err) {
        console.error('Add comment error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

