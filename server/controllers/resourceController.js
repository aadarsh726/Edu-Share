const Resource = require('../models/Resource');
const fetch = require('node-fetch'); 
const { cloudinary } = require('../config/cloudinary'); 
const path = require('path'); // For path utilities

// helper: try to extract public_id from a Cloudinary url
function extractPublicIdFromUrl(url) {
    if (!url) return null;
    const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./?#]+)?$/i);
    return m ? m[1] : null;
}


// @desc    Upload a new resource
exports.uploadResource = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Debug: Log what multer-storage-cloudinary returns
        console.log('=== UPLOAD DEBUG ===');
        console.log('req.file:', JSON.stringify(req.file, null, 2));
        console.log('===================');

        // Get sanitized data from req.file (from our fixed cloudinary.js config)
        const cloudUrl = req.file.path || req.file.secure_url || req.file.url;
        
        // Extract public_id properly - multer-storage-cloudinary returns public_id in different formats
        // Option 1: If public_id is directly available
        // Option 2: Extract from URL (full path including folder)
        // Option 3: Use filename and add folder if needed
        let publicId = req.file.public_id || req.file.filename;
        
        // If public_id doesn't include folder, construct it from URL or add folder prefix
        if (cloudUrl && !publicId.includes('/')) {
            // Try to extract from URL first (most reliable)
            const extractedId = extractPublicIdFromUrl(cloudUrl);
            if (extractedId) {
                publicId = extractedId;
            } else {
                // Fallback: construct from folder + filename (without extension)
                const filenameWithoutExt = req.file.filename.replace(/\.[^./]+$/, '');
                publicId = `EduShare_Files/${filenameWithoutExt}`;
            }
        }
        
        // Remove file extension from public_id if it exists (Cloudinary stores without extension)
        const publicIdWithoutExt = publicId.replace(/\.[^./]+$/, '');
        
        const originalName = req.file.originalname;
        const fileFormat = originalName ? originalName.split('.').pop() : '';
        const resourceType = req.file.mimetype && req.file.mimetype.startsWith('image') ? 'image' : 'raw';


        // Get optional fields
        const { title, description, subject, course, tags } = req.body;
        const semester = Number(req.body.semester);

        const newResource = new Resource({
            title: title || originalName,
            description: description,
            subject: subject || 'general',
            course: course,
            semester: semester || undefined,
            tags: tags ? tags.split(',') : [],
            uploadedBy: req.user.id,

            // Save all metadata
            cloudinaryUrl: cloudUrl,
            cloudinaryPublicId: publicIdWithoutExt, // Store without extension for Cloudinary API
            resourceType: resourceType,
            format: fileFormat,
            mimeType: req.file.mimetype,
            originalFilename: originalName,
            
            // Temporary value
            fileUrl: 'temp', 
        });

        // 1. First, save to get the MongoDB ID
        await newResource.save();
        
        // 2. Second, update the fileUrl to point to OUR server's download link
        newResource.fileUrl = `/api/resources/${newResource._id}/download`;
        await newResource.save(); // Save again with the final fileUrl

        res.status(201).json(newResource);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
};

// --- Download endpoint that proxies the file and handles 401s ---
exports.downloadResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        let fileUrl = resource.cloudinaryUrl || null;
        let remote;

        // Try direct fetch first
        if (fileUrl) {
            remote = await fetch(fileUrl);
        }

        // if fetch failed with 401 (or no fileUrl) try to create a signed Cloudinary private-download url
        if (!remote || !remote.ok || remote.status === 401) {
            let publicId = resource.cloudinaryPublicId || extractPublicIdFromUrl(resource.cloudinaryUrl);
            
            if (!publicId) {
                console.error('No public id available for signed URL generation.'); 
                return res.status(502).json({ message: 'File not available from storage' });
            }

            const format = (resource.format || (resource.originalFilename ? resource.originalFilename.split('.').pop() : undefined) || '').toLowerCase();

            // Decide correct resource_type for Cloudinary
            const imageFormats = new Set(['jpg','jpeg','png','gif','webp','bmp','tiff','svg']);
            const mime = (resource.mimeType || '').toLowerCase();
            const isImage = mime.startsWith('image/') || imageFormats.has(format);
            const resourceTypeForDownload = isImage ? 'image' : 'raw';

            // Ensure public_id does NOT include extension when signing
            if (publicId && /\.[^./]+$/.test(publicId)) {
                publicId = publicId.replace(/\.[^./]+$/, '');
            }
            
            // Generate signed private download url (uses cloudinary utils)
            // API signature: private_download_url(public_id, format, options)
            const signedUrl = cloudinary.utils.private_download_url(
                publicId,
                format || undefined,
                { resource_type: resourceTypeForDownload }
            );

            // Fetch the signed url
            remote = await fetch(signedUrl);
            if (!remote.ok) {
                console.error('Signed URL fetch failed:', remote.status, remote.statusText, { resourceTypeForDownload, publicId, format });
                return res.status(502).json({ message: 'Failed to fetch file from storage' });
            }
        }

        // Stream response to client with proper headers
        const contentType = remote.headers.get('content-type') || resource.mimeType || 'application/octet-stream';
        const filename = (resource.originalFilename || resource.title || `resource-${resource._id}`).replace(/"/g, '');
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe the remote body (the file stream) to the client
        remote.body.pipe(res);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Server error while downloading file' });
    }
};


// --- Existing getResources handler (keep this at the bottom) ---
exports.getResources = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.max(parseInt(req.query.limit || '6', 10), 1);
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Resource.find({})
                .populate('uploadedBy', 'username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Resource.countDocuments({})
        ]);

        const totalPages = Math.max(Math.ceil(total / limit), 1);
        res.status(200).json({ items, page, totalPages, total, limit });
    } catch (err) {
        console.error("---!! GET RESOURCES FAILED !! ---", err);
        res.status(500).send('Server Error');
    }
};

// --- Delete a resource (teachers only) ---
exports.deleteResource = async (req, res) => {
    try {
        // Require authenticated user with role 'teacher'
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        // Attempt to delete from Cloudinary if we have a public_id
        if (resource.cloudinaryPublicId) {
            const resourceType = (resource.mimeType || '').startsWith('image/') ? 'image' : 'raw';
            try {
                await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
                    resource_type: resourceType,
                    invalidate: true
                });
            } catch (e) {
                console.error('Cloudinary delete failed:', e.message);
            }
        }

        await Resource.deleteOne({ _id: resource._id });
        return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ message: 'Server error while deleting file' });
    }
};




// const Resource = require('../models/Resource');

// // @desc    Upload a new resource
// exports.uploadResource = async (req, res) => {
    
//     try {
//         const { title, description, subject, course, tags } = req.body;
//         const semester = Number(req.body.semester);
//         if (isNaN(semester) && req.body.semester) {
//             return res.status(400).json({ msg: 'Semester must be a valid number.' });
//         }
//         if (!req.file) {
//             return res.status(400).json({ msg: 'Please upload a file' });
//         }
        
//         const { path, mimetype, filename, originalname } = req.file;

//         if (!originalname) {
//              console.error("---!! CRITICAL ERROR: req.file.originalname is MISSING !! ---");
//         }
//         if (!req.file.path || !req.file.filename) {
//             return res.status(500).json({ msg: 'File upload failed, please try again.' });
//         }

//         const uploadedBy = req.user.id;

//         const newResource = new Resource({
//             title,
//             description,
//             subject,
//             course,
//             semester: semester || undefined,
//             tags: tags ? tags.split(',') : [],
//             fileUrl: path, 
//             fileType: mimetype,
//             cloudinaryId: filename,
//             originalFilename: originalname, // We are saving the real name
//             uploadedBy
//         });

//         const savedResource = await newResource.save();
//         res.status(201).json(savedResource);
//     } catch (err) {
//         console.error("---!! UPLOAD FAILED !! ---");
//         console.error("Error Message:", err.message);
//         res.status(500).send('Server Error (Check Backend Console)');
//     }
// };


// // @desc    Get all resources
// exports.getResources = async (req, res) => {
//     try {
//         const filters = {};
//         if (req.query.subject) filters.subject = new RegExp(req.query.subject, 'i');
//         if (req.query.course) filters.course = new RegExp(req.query.course, 'i');
        
//         if (req.query.semester) {
//             const sem = Number(req.query.semester);
//             if (!isNaN(sem)) {
//                 filters.semester = sem;
//             }
//         }
        
//         const resources = await Resource.find(filters)
//             .populate('uploadedBy', 'username')
//             .sort({ createdAt: -1 });
//         res.status(200).json(resources);
//     } catch (err)
//         {
//         console.error("---!! GET RESOURCES FAILED !! ---");
//         console.error("Error Message:", err.message);
//         res.status(500).send('Server Error');
//     }
// };