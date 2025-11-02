import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import our new Navbar
import AppNavbar from './components/Navbar'; 

// Import our pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage'; // <-- 1. IMPORT IT
import FeedPage from './pages/FeedPage'; // <-- 1. IMPORT IT
import ProfilePage from './pages/ProfilePage'; // <-- 1. IMPORT IT
function App() {
    return (
        <AuthProvider>
          <div data-bs-theme="dark">
            {/* The Navbar goes here, so it's on every page */}
            <AppNavbar /> 

            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Private Routes (We'll protect these later) */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/upload" element={<UploadPage />} /> {/* <-- 2. ADD THIS ROUTE */}
                    <Route path="/feed" element={<FeedPage />} /> {/* <-- 2. ADD THIS ROUTE */}
                    <Route path="/profile/:id" element={<ProfilePage />} /> {/* <-- 2. ADD THIS ROUTE */}
                </Routes>
            </main>
          </div>
        </AuthProvider>
    );
}

export default App;