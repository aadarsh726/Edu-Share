// 1. Load .env file (MUST BE FIRST)
const dotenv = require('dotenv');
dotenv.config(); 

// 2. Import Packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 3. Initialize App
const app = express();

// 4. Setup Middleware
app.use(cors()); // Allows requests from other origins (Like your React frontend)
app.use(express.json()); // Allows us to read JSON data from request bodies

// 5. Define API Routes (CLEANED UP - NO DUPLICATES)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

// 6. Connect to Database
// (Your 'connectDB' function and 'app.listen' code go here)

// 6. Connect to Database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected... 🍃');
    } catch (err) {
        console.error('MongoDB Connection Error: ', err.message);
        process.exit(1); // Exit process with failure
    }
};

connectDB(); // Call the function to connect

// 7. Start the Server
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// ... (all your existing code) ...

// 5. Define API Routes
 // <-- ADD THIS LINE

// ... (rest of your code) ...