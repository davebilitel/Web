import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
    const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large'

    // Load preferences from localStorage
    useEffect(() => {
        const savedFontSize = localStorage.getItem('font-size-preference');
        if (savedFontSize) {
            setFontSize(savedFontSize);
        }
    }, []);

    // Save preferences to localStorage
    useEffect(() => {
        localStorage.setItem('font-size-preference', fontSize);
    }, [fontSize]);

    return (
        <AccessibilityContext.Provider value={{
            fontSize,
            setFontSize
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    return useContext(AccessibilityContext);
} 