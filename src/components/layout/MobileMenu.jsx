import React from 'react';
import { Menu, X, Bell } from 'lucide-react';

const MobileMenu = ({ 
    isMenuOpen, 
    onMenuToggle, 
    isAuthenticated, 
    unreadCount, 
    onNotificationsToggle 
}) => {
    return (
        <div className="flex items-center md:hidden">
            {isAuthenticated && (
                <button
                    onClick={onNotificationsToggle}
                    className="relative p-2 mr-4"
                >
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-900">
                            {unreadCount}
                        </span>
                    )}
                    <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
            )}
            <button
                onClick={onMenuToggle}
                className="p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default MobileMenu;