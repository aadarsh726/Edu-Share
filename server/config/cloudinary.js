const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path'); 

// This new log will prove you are running the new code
console.log("---!! LOADING FINAL-FIX cloudinary.js (v18-PATH-FIX) !! ---"); 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- THIS FUNCTION IS UPDATED ---
// Sanitize filename but return WITHOUT extension (Cloudinary stores extension separately)
function sanitizeFilename(filename) {
    const name = path.parse(filename).name;
    
    const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Return without extension - Cloudinary will add it based on the uploaded file
    return `${Date.now()}-${cleanName}`;
}
// --- END OF FUNCTION ---

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        let resourceType = 'auto';
        if (file.mimetype.includes('pdf') || file.mimetype.includes('doc')) {
            resourceType = 'raw';   
        } else if (file.mimetype.includes('image')) {
            resourceType = 'image';
        }

        return {
            folder: 'EduShare_Files', 
            resource_type: resourceType,
            
            // --- THIS IS THE FINAL FIX ---
            // We only need the CLEAN FILENAME here. The 'folder' parameter 
            // handles the path, and this prevents the duplication.
            public_id: sanitizeFilename(file.originalname)
        };
        // --- END OF FINAL FIX ---
    }
});

module.exports = { cloudinary, storage };
