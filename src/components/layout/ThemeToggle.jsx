import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;