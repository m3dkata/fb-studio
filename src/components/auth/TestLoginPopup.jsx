import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const TestLoginPopup = ({ isOpen, onClose, isLoading, error, onTestUserLogin, onTestArtistLogin }) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Test Account Login" size="sm">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use these test accounts to quickly explore the application:
                </p>

                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        onClick={onTestUserLogin}
                        className="w-full transition-all duration-300"
                        isLoading={isLoading}
                        size="lg"
                        variant="outline"
                    >
                        Login as test User account
                    </Button>

                    <Button
                        onClick={onTestArtistLogin}
                        className="w-full transition-all duration-300"
                        isLoading={isLoading}
                        size="lg"
                        variant="outline"
                    >
                        Login as test Artist account
                    </Button>
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <p>Test User Credentials: email: user@kidn3y.com | pass: User1234</p>
                    <p>Test Artist Credentials: email: artist@kidn3y.com | pass: Artist1234</p>
                </div>
            </div>
        </Modal>
    );
};

export default TestLoginPopup;