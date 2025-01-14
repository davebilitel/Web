import { useEffect } from 'react';

export function useScrollLock(lock) {
    useEffect(() => {
        if (lock) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            return () => {
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            };
        }
    }, [lock]);
} 