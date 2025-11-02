const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Please provide a username'], 
        unique: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Please provide an email'], 
        unique: true, 
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    password: { 
        type: String, 
        required: [true, 'Please provide a password'], 
        minlength: 6 
    },
    role: { 
        type: String, 
        enum: ['student', 'teacher'], 
        default: 'student' 
    },
    followers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    following: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    // Contribution score: tracks user's contribution to the platform
    score: {
        type: Number,
        default: 0,
        min: 0
    }
    
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Index for efficient leaderboard queries
UserSchema.index({ score: -1 });

module.exports = mongoose.model('User', UserSchema);