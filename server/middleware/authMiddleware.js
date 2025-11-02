const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get user from the token's ID and attach it to the request object
            // We select '-password' to exclude the password from being attached
            req.user = await User.findById(decoded.user.id).select('-password');

            next(); // Move on to the next function (the controller)
        } catch (error) {
            console.error(error);
            res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ msg: 'Not authorized, no token' });
    }
};