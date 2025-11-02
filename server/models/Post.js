const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: [true, 'Post content cannot be empty'] 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Likes array: stores user IDs who liked this post
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    comments: [
        {
            text: { type: String, required: true },
            username: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            // Likes array: stores user IDs who liked this comment
            likes: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            }]
        }
    ]
}, { timestamps: true }); // timestamps adds `createdAt` and `updatedAt`

// Index for efficient querying on likes
PostSchema.index({ likes: 1 });

module.exports = mongoose.model('Post', PostSchema);