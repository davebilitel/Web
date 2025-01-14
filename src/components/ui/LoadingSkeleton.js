import React from 'react';

function LoadingSkeleton({ type }) {
    switch (type) {
        case 'hero':
            return (
                <div className="animate-pulse">
                    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                </div>
            );
        case 'features':
            return (
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    ))}
                </div>
            );
        // Add other skeleton types...
        default:
            return null;
    }
}

export default LoadingSkeleton; 