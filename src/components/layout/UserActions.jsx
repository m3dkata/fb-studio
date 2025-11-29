import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import Button from '../ui/Button';

const UserActions = ({ isAuthenticated, user, logout }) => {
    if (isAuthenticated) {
        return (
            <div className="flex items-center space-x-4">
                <Link
                    to="/profile"
                    className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
                >
                    <div className="flex items-center justify-center w-8 h-8 mr-2 overflow-hidden text-white rounded-full shadow-md bg-gradient-to-br from-teal-500 to-green-500">
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
                    {user.name?.split(' ')[0]}
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
                <Button variant="primary" size="sm" className="shadow-lg shadow-teal-500/30">
                    Get Started
                </Button>
            </Link>
        </div>
    );
};

export default UserActions;