const System = require('../models/System');
const User = require('../models/User');

/**
 * Determines if we have crossed into a new weekly window since last reset.
 * Weekly reset time: Sunday 00:00 server time.
 */
function getCurrentWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    const diff = day; // days since last Sunday
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - diff);
    return d.getTime();
}

async function performWeeklyResetIfNeeded() {
    try {
        const key = 'weeklyLeaderboard';
        const record = await System.findOne({ key });
        const thisWeekStart = getCurrentWeekStart();

        const lastReset = record?.value?.lastResetTs || 0;
        // If we haven't reset since this week's start and it is Sunday 00:00 or later, reset
        if (lastReset < thisWeekStart) {
            // Reset weeklyScore for all users to 0
            await User.updateMany({}, { $set: { weeklyScore: 0 } });
            await System.findOneAndUpdate(
                { key },
                { $set: { value: { lastResetTs: Date.now() } } },
                { upsert: true }
            );
            console.log('🏆 Weekly leaderboard scores reset');
        }
    } catch (err) {
        console.error('Weekly reset job error:', err.message);
    }
}

function startWeeklyResetScheduler() {
    // Check every minute to keep it simple, without external deps
    performWeeklyResetIfNeeded();
    setInterval(performWeeklyResetIfNeeded, 60 * 1000);
    console.log('⏱️  Weekly reset scheduler started (checks every 1 min)');
}

module.exports = { startWeeklyResetScheduler };


