import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`glass-card rounded-xl overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-xl font-bold text-gray-900 dark:text-white font-heading ${className}`}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 ${className}`}>
        {children}
    </div>
);

export default Card;
