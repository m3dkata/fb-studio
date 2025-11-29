import React, { forwardRef } from 'react';

const Select = forwardRef(({
    label,
    error,
    options = [],
    className = '',
    id,
    placeholder = 'Select an option',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                id={id}
                className={`
          block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-primary focus:ring-primary sm:text-sm 
          disabled:bg-gray-100 disabled:cursor-not-allowed
          bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
                {...props}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
