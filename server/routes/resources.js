// const express = require('express');
// const router = express.Router();

// // --- THIS IS THE FIX ---
// // We are only importing the TWO functions that actually exist.
// const { 
//     uploadResource, 
//     getResources
// } = require('../controllers/resourceController');
// // --- END OF FIX ---

// const { protect } = require('../middleware/authMiddleware');
// const upload = require('../middleware/multer');

// // @route   POST /api/resources/upload
// router.post('/upload', protect, upload.single('file'), uploadResource);

// // @route   GET /api/resources
// router.get('/', getResources);

// // We have removed the broken '/:id/download' route

// module.exports = router;

const express = require('express');
const router = express.Router();

const { 
    uploadResource, 
    getResources,
    downloadResource,
    deleteResource
} = require('../controllers/resourceController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// @route   POST /api/resources/upload
router.post('/upload', protect, upload.single('file'), uploadResource);

// @route   GET /api/resources
router.get('/', getResources);

// --- DOWNLOAD ROUTE (PUBLIC) ---
router.get('/:id/download', downloadResource);

// --- DELETE (Teachers only) ---
router.delete('/:id', protect, deleteResource);

module.exports = router;