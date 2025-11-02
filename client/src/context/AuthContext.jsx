import React, { createContext, useState, useEffect } from 'react';
// We removed the unused 'api' import
import { jwtDecode } from 'jwt-decode';

// --- IMPORTANT ---
// Make sure you ran this command in your /client terminal:
// npm install jwt-decode
// ---

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null
    });

    const logout = () => {
        localStorage.removeItem('token');
        setAuth({
            token: null,
            isAuthenticated: false,
            loading: false,
            user: null
        });
    };

    // We moved this function up
    const fetchUserFromToken = (token) => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const user = {
                    id: decodedToken.user.id,
                    role: decodedToken.user.role
                };
                setAuth({
                    token: token,
                    isAuthenticated: true,
                    loading: false,
                    user: user
                });
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        } else {
            setAuth({
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null
            });
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetchUserFromToken(token);
        
        // --- THIS COMMENT FIXES THE [] WARNING ---
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // This [] is 100% correct. It means "run only once on load".

    const login = (token) => {
        localStorage.setItem('token', token);
        fetchUserFromToken(token);
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {!auth.loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;