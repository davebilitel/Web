import React, { useState, useEffect } from 'react';
import Skeleton from './Skeleton';

function LazyImage({ src, alt, className = '', width, height }) {
    const [isLoading, setIsLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
        };
    }, [src]);

    if (isLoading) {
        return (
            <Skeleton 
                variant="rectangular" 
                width={width} 
                height={height}
                className={className}
            />
        );
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            width={width}
            height={height}
        />
    );
}

export default LazyImage; 