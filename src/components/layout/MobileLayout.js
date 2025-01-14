import React from 'react';

function MobileLayout({ children }) {
    return (
        <div className="mobile-layout">
            <div className="mobile-content">
                {children}
            </div>
            <div className="mobile-navigation">
                {/* Add mobile-specific navigation here */}
            </div>
        </div>
    );
}

export default MobileLayout; 