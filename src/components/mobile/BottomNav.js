import React from 'react';
import { Link } from 'react-router-dom';

function BottomNav() {
    return (
        <nav className="mobile-bottom-nav">
            <Link to="/" className="nav-item">
                <HomeIcon className="w-6 h-6" />
                <span>Home</span>
            </Link>
            {/* Add other navigation items */}
        </nav>
    );
}

export default BottomNav; 