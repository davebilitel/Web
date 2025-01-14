import React, { createContext, useContext, useState, useEffect } from 'react';
import { isMobile } from '../utils/mobile';

const MobileContext = createContext();

export function MobileProvider({ children }) {
    const [isMobileDevice, setIsMobileDevice] = useState(isMobile());
    const [orientation, setOrientation] = useState(window.orientation);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileDevice(isMobile());
            setOrientation(window.orientation);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return (
        <MobileContext.Provider value={{ isMobileDevice, orientation }}>
            {children}
        </MobileContext.Provider>
    );
}

export const useMobile = () => useContext(MobileContext); 