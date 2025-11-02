const Post = require('../models/Post');

// @desc    Like a comment (add user to comment's likes array within a post)
// @route   POST /api/comments/:postId/like
// @access  Private (requires token)
// Body should contain: { commentCreatedAt: "ISO date string" }
exports.likeComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { commentCreatedAt } = req.body;
        const userId = req.user.id; // Get user ID from authentication middleware

        // Validate input
        if (!commentCreatedAt) {
            return res.status(400).json({ msg: 'commentCreatedAt is required in request body' });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Find the comment by createdAt timestamp
        const comment = post.comments.find(c => {
            const commentDate = new Date(c.createdAt).toISOString();
            const requestedDate = new Date(commentCreatedAt).toISOString();
            return commentDate === requestedDate;
        });

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        const commentIndex = post.comments.indexOf(comment);

        // Initialize likes array if it doesn't exist (for old comments)
        if (!comment.likes) {
            comment.likes = [];
        }

        // Check if user has already liked this comment
        const hasLiked = comment.likes.some(
            likeId => likeId.toString() === userId.toString()
        );
        
        if (hasLiked) {
            await post.populate('author', 'username');
            return res.status(400).json({ 
                msg: 'Comment already liked',
                post: post,
                likesCount: comment.likes.length
            });
        }

        // Add user to comment's likes array
        comment.likes.push(userId);
        await post.save();

        // Populate author before returning
        await post.populate('author', 'username');
        
        res.status(200).json({
            msg: 'Comment liked successfully',
            post: post,
            commentIndex: commentIndex,
            likesCount: comment.likes.length
        });

    } catch (err) {
        console.error('Like comment error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Unlike a comment (remove user from comment's likes array within a post)
// @route   POST /api/comments/:postId/unlike
// @access  Private (requires token)
// Body should contain: { commentCreatedAt: "ISO date string" }
exports.unlikeComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { commentCreatedAt } = req.body;
        const userId = req.user.id; // Get user ID from authentication middleware

        // Validate input
        if (!commentCreatedAt) {
            return res.status(400).json({ msg: 'commentCreatedAt is required in request body' });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Find the comment by createdAt timestamp
        const comment = post.comments.find(c => {
            const commentDate = new Date(c.createdAt).toISOString();
            const requestedDate = new Date(commentCreatedAt).toISOString();
            return commentDate === requestedDate;
        });

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        const commentIndex = post.comments.indexOf(comment);

        // Initialize likes array if it doesn't exist
        if (!comment.likes) {
            comment.likes = [];
        }

        // Check if user has liked this comment
        const hasLiked = comment.likes.some(
            likeId => likeId.toString() === userId.toString()
        );
        
        if (!hasLiked) {
            await post.populate('author', 'username');
            return res.status(400).json({ 
                msg: 'Comment not liked yet',
                post: post,
                likesCount: comment.likes.length
            });
        }

        // Remove user from comment's likes array
        comment.likes = comment.likes.filter(
            likeId => likeId.toString() !== userId.toString()
        );
        await post.save();

        // Populate author before returning
        await post.populate('author', 'username');
        
        res.status(200).json({
            msg: 'Comment unliked successfully',
            post: post,
            commentIndex: commentIndex,
            likesCount: comment.likes.length
        });

    } catch (err) {
        console.error('Unlike comment error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

