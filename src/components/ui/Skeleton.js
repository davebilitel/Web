import React from 'react';

function Skeleton({ variant = 'rectangular', width, height, className = '' }) {
    const baseClasses = 'animate-pulse bg-gray-200 rounded';
    
    switch (variant) {
        case 'circular':
            return (
                <div 
                    className={`${baseClasses} rounded-full ${className}`}
                    style={{ width, height }}
                />
            );
            
        case 'text':
            return (
                <div 
                    className={`${baseClasses} h-4 ${className}`}
                    style={{ width }}
                />
            );
            
        default:
            return (
                <div 
                    className={`${baseClasses} ${className}`}
                    style={{ width, height }}
                />
            );
    }
}

export default Skeleton; 