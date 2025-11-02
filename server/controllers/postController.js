const Post = require('../models/Post');
const { updateUserScore } = require('../utils/scoreUtils');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (requires token)
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ msg: 'Content is required' });
        }

        const newPost = new Post({
            content,
            author: req.user.id // We get 'req.user' from our 'protect' middleware
        });

        const savedPost = await newPost.save();
        
        // We populate 'author' to send back the username with the new post
        await savedPost.populate('author', 'username');

        // Award +5 points for creating a post
        await updateUserScore(req.user.id, 5);

        res.status(201).json(savedPost);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
    try {
        // Find all posts, sort by newest first (-1)
        const posts = await Post.find()
            .populate('author', 'username') // Replace author ID with username
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Like a post (add user to likes array)
// @route   POST /api/posts/:id/like
// @access  Private (requires token)
exports.likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Get user ID from authentication middleware

        // Find the post
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Initialize likes array if it doesn't exist (for old posts)
        if (!post.likes) {
            post.likes = [];
        }

        // Check if user has already liked this post
        // Convert to string for comparison (handles ObjectId comparison)
        const hasLiked = post.likes.some(
            likeId => likeId.toString() === userId.toString()
        );
        
        if (hasLiked) {
            return res.status(400).json({ 
                msg: 'Post already liked',
                post: post,
                likesCount: post.likes.length
            });
        }

        // Add user to likes array
        post.likes.push(userId);
        await post.save();

        // Populate author before returning
        await post.populate('author', 'username');

        // Award +1 point to post author for receiving a like
        await updateUserScore(post.author._id || post.author, 1);
        
        res.status(200).json({
            msg: 'Post liked successfully',
            post: post,
            likesCount: post.likes.length
        });

    } catch (err) {
        console.error('Like post error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Unlike a post (remove user from likes array)
// @route   POST /api/posts/:id/unlike
// @access  Private (requires token)
exports.unlikePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Get user ID from authentication middleware

        // Find the post
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Initialize likes array if it doesn't exist
        if (!post.likes) {
            post.likes = [];
        }

        // Check if user has liked this post
        const hasLiked = post.likes.some(
            likeId => likeId.toString() === userId.toString()
        );
        
        if (!hasLiked) {
            return res.status(400).json({ 
                msg: 'Post not liked yet',
                post: post,
                likesCount: post.likes.length
            });
        }

        // Remove user from likes array
        post.likes = post.likes.filter(
            likeId => likeId.toString() !== userId.toString()
        );
        await post.save();

        // Populate author before returning
        await post.populate('author', 'username');

        // Remove 1 point from post author when unliked
        await updateUserScore(post.author._id || post.author, -1);
        
        res.status(200).json({
            msg: 'Post unliked successfully',
            post: post,
            likesCount: post.likes.length
        });

    } catch (err) {
        console.error('Unlike post error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};