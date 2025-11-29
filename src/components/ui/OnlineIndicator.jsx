import React from 'react';

const OnlineIndicator = ({ isOnline, size = 'sm', showPulse = true }) => {
    const sizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <div className="relative inline-flex">
            <span
                className={`${sizeClasses[size]} rounded-full ${isOnline
                        ? 'bg-green-500'
                        : 'bg-gray-400 dark:bg-gray-600'
                    }`}
            />
            {isOnline && showPulse && (
                <span
                    className={`absolute inline-flex ${sizeClasses[size]} rounded-full bg-green-400 opacity-75 animate-ping`}
                />
            )}
        </div>
    );
};

export default OnlineIndicator;
