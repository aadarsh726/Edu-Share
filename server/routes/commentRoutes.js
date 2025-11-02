const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

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

        // Create new comment object
        const newComment = {
            text,
            username,
            createdAt: new Date()
        };

        // Push comment to post's comments array
        post.comments.push(newComment);

        // Save the post
        const updatedPost = await post.save();

        // Populate author before sending response
        await updatedPost.populate('author', 'username');

        res.status(200).json(updatedPost);

    } catch (err) {
        console.error('Add comment error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

