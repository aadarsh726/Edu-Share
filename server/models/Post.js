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
    // We can add likes later
    // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    
}, { timestamps: true }); // timestamps adds `createdAt` and `updatedAt`

module.exports = mongoose.model('Post', PostSchema);