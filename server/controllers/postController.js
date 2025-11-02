const Post = require('../models/Post');

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