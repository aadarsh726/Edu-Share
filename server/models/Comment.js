const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: [true, 'Comment content cannot be empty'] 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    }
}, { timestamps: true }); // timestamps adds `createdAt` and `updatedAt`

module.exports = mongoose.model('Comment', CommentSchema);

