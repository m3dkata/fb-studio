import React, { createContext, useState, useEffect, useMemo } from 'react';
import authService from '../services/auth';
import { USER_TYPES } from '../constants/userTypes';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);
        }
        setLoading(false);

        // Subscribe to auth changes
        const unsubscribe = authService.onAuthChange((model) => {
            setUser(model);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        try {
            const authData = await authService.login(email, password);
            setUser(authData.record);
            return authData.record;
        } catch (error) {
            throw error;
        }
    };

    const register = async (data) => {
        try {
            const user = await authService.register(data);
            setUser(user);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const updateProfile = async (data) => {
        try {
            const updatedUser = await authService.updateProfile(user.id, data);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    };

    const isAdmin = () => {
        return user && user.user_type === USER_TYPES.ADMIN;
    };

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isAuthenticated: !!user,
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
