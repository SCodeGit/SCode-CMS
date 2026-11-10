// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

// Create the context
export const AuthContext = createContext();

// AuthProvider to wrap your app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Load user/token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
        }
    }, []);

    // Login function
    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
