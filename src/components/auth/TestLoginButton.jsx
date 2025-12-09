import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { USER_TYPES } from '../../constants/userTypes';
import { User } from 'lucide-react';
import TestLoginPopup from './TestLoginPopup';

const TestLoginButton = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isTestLoginPopupOpen, setIsTestLoginPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const from = location.state?.from?.pathname;

    if (isAuthenticated) {
        return null;
    }

    const handleTestUserLogin = async () => {
        await handleLogin('user@kidn3y.com', 'User1234');
    };

    const handleTestArtistLogin = async () => {
        await handleLogin('artist@kidn3y.com', 'Artist1234');
    };

    const handleLogin = async (email, password) => {
        setIsLoading(true);
        setError('');

        try {
            const user = await login(email, password);

            let redirectPath = from || '/dashboard';

            if (user.user_type === USER_TYPES.ADMIN) {
                redirectPath = '/admin';
            }

            navigate(redirectPath, { replace: true });
            setIsTestLoginPopupOpen(false);
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsTestLoginPopupOpen(true)}
                className="flex items-center px-3 py-2 space-x-2 text-sm font-medium text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700 animate-pulse-slow hover:animate-none"
                aria-label="Test account login"
            >
                <User className="w-4 h-4 animate-bounce-slow" />
                <span className="hidden sm:inline">Test Login</span>
            </button>

            <TestLoginPopup
                isOpen={isTestLoginPopupOpen}
                onClose={() => setIsTestLoginPopupOpen(false)}
                isLoading={isLoading}
                error={error}
                onTestUserLogin={handleTestUserLogin}
                onTestArtistLogin={handleTestArtistLogin}
            />
        </>
    );
};

export default TestLoginButton;