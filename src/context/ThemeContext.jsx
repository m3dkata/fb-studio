import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Get theme from localStorage or default to light
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        // Apply theme class to document for Tailwind dark mode
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark',
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
