import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    className = '',
    id,
    type = 'text',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                type={type}
                className={`
          block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-primary focus:ring-primary sm:text-sm 
          disabled:bg-gray-100 disabled:cursor-not-allowed
          bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
