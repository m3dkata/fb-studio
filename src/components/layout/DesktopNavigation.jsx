import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DesktopNavigation = ({ navLinks }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="items-center hidden space-x-8 md:flex">
            {navLinks.map((link) => (
                <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${isActive(link.path)
                        ? 'text-primary font-bold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                        }`}
                >
                    {link.name}
                </Link>
            ))}
        </nav>
    );
};

export default DesktopNavigation;