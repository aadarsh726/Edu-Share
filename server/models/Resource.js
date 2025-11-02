const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true, index: true },
    course: { type: String },
    semester: { type: Number, index: true },
    
    // Core fields:
    fileUrl: { type: String, required: true }, // Will store the server download route
    originalFilename: { type: String, required: true },
    
    // --- FIELDS MUST BE OPTIONAL TO PREVENT CRASH ---
    cloudinaryUrl: { type: String }, // Made optional
    cloudinaryPublicId: { type: String }, // Made optional
    resourceType: { type: String },
    format: { type: String },
    mimeType: { type: String },
    // --- END OPTIONAL FIELDS ---

    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    tags: [String]
    
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);

// const mongoose = require('mongoose');

// const ResourceSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     description: { type: String },
//     subject: { type: String, required: true, index: true },

//     course: { type: String },
//     semester: { type: Number, index: true },
    
//     // This is the correct field
//     fileUrl: { type: String, required: true }, 
    
//     fileType: { type: String, required: true },
//     cloudinaryId: { type: String, required: true },
    
//     // This fixes the garbled download name
//     originalFilename: { type: String, required: true }, 
    
//     uploadedBy: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'User', 
//         required: true 
//     },
//     tags: [String]
    
// }, { timestamps: true });

// module.exports = mongoose.model('Resource', ResourceSchema);