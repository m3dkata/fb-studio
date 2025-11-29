import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ onClick }) => {
    return (
        <Link to="/" className="flex items-center flex-shrink-0 group" onClick={onClick}>
            <span className="text-2xl font-bold transition-opacity font-heading text-gradient group-hover:opacity-80">
                FB Studio
            </span>
        </Link>
    );
};

export default Logo;