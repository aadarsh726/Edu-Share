const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Initialize multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

module.exports = upload;