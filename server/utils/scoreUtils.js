const User = require('../models/User');

/**
 * Update a user's contribution score
 * @param {String} userId - The user ID to update
 * @param {Number} points - Points to add (can be negative)
 * @returns {Promise} - Updated user document
 */
const updateUserScore = async (userId, points) => {
    try {
        if (!userId) {
            console.warn('updateUserScore: No userId provided');
            return null;
        }

        // Use $inc to atomically increment the score
        // This prevents race conditions when multiple actions happen simultaneously
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { score: points } },
            { new: true } // Return updated document
        );

        // Ensure score doesn't go below 0
        if (updatedUser && updatedUser.score < 0) {
            updatedUser.score = 0;
            await updatedUser.save();
        }

        return updatedUser;
    } catch (error) {
        console.error('Error updating user score:', error);
        return null;
    }
};

module.exports = {
    updateUserScore
};

