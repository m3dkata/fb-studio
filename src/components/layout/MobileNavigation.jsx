import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import Button from '../ui/Button';

const MobileNavigation = ({ 
    isOpen, 
    navLinks, 
    isDark, 
    onThemeToggle, 
    isAuthenticated, 
    user, 
    logout, 
    onCloseMenu 
}) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute left-0 w-full border-t border-gray-200 md:hidden top-full glass dark:border-gray-800 animate-slide-down">
            <div className="px-4 py-6 space-y-3">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                    <button
                        onClick={onThemeToggle}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        {isDark ? (
                            <>
                                <Sun className="w-4 h-4" />
                                <span>Light</span>
                            </>
                        ) : (
                            <>
                                <Moon className="w-4 h-4" />
                                <span>Dark</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={onCloseMenu}
                            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors text-center ${isActive(link.path)
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* User Actions */}
                <div className="pt-3 space-y-2 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/profile"
                                onClick={onCloseMenu}
                                className="flex items-center justify-center px-4 py-3 text-gray-700 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <div className="flex items-center justify-center w-8 h-8 mr-3 overflow-hidden text-white rounded-full shadow-md bg-gradient-to-br from-teal-500 to-green-500">
                                    {user.avatar ? (
                                        <img
                                            src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`}
                                            alt={user.name}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>
                                <span className="font-medium">Profile</span>
                            </Link>
                            <button
                                onClick={() => { logout(); onCloseMenu(); }}
                                className="flex items-center justify-center w-full px-4 py-3 text-red-600 transition-colors rounded-lg dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Link to="/login" onClick={onCloseMenu}>
                                <Button variant="outline" className="w-full my-2">Login</Button>
                            </Link>
                            <Link to="/register" onClick={onCloseMenu}>
                                <Button variant="primary" className="w-full my-2">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileNavigation;