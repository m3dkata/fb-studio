import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({
    label,
    description,
    error,
    className = '',
    id,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            <label
                htmlFor={id}
                className={`
                    flex items-start p-3 rounded-lg cursor-pointer transition-all duration-200
                    hover:bg-gray-50 dark:hover:bg-gray-800/50
                    ${error ? 'bg-red-50 dark:bg-red-900/10' : ''}
                    ${className}
                `}
            >
                <div className="relative flex items-center justify-center flex-shrink-0">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={id}
                        className="
                            peer h-5 w-5 cursor-pointer appearance-none rounded border-2 
                            border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-800
                            transition-all duration-200
                            checked:bg-gradient-to-r checked:from-teal-500 checked:to-green-500
                            checked:border-transparent
                            focus:ring-4 focus:ring-primary/20 focus:ring-offset-0
                            hover:border-primary dark:hover:border-primary
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                        {...props}
                    />
                    { }
                    <svg
                        className="
                            absolute w-3.5 h-3.5 pointer-events-none
                            text-white opacity-0 peer-checked:opacity-100
                            transition-opacity duration-200
                        "
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {(label || description) && (
                    <div className="ml-3 flex-1">
                        {label && (
                            <span className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                                {label}
                            </span>
                        )}
                        {description && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </label>

            {error && (
                <p className="mt-1 ml-8 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
