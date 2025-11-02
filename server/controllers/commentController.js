const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Add a comment to a post
// @route   POST /api/comments/:postId
// @access  Private (requires token)
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;

        if (!content) {
            return res.status(400).json({ msg: 'Comment content is required' });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const newComment = new Comment({
            content,
            author: req.user.id, // We get 'req.user' from our 'protect' middleware
            post: postId
        });

        const savedComment = await newComment.save();
        
        // Populate 'author' to send back the username with the new comment
        await savedComment.populate('author', 'username');

        res.status(201).json(savedComment);

    } catch (err) {
        console.error('Add comment error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all comments for a post
// @route   GET /api/comments/:postId
// @access  Public
exports.getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Find all comments for this post, sort by newest first
        const comments = await Comment.find({ post: postId })
            .populate('author', 'username') // Replace author ID with username
            .sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (err) {
        console.error('Get comments error:', err.message);
        res.status(500).send('Server Error');
    }
};

