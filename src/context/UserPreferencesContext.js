import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();
const STORAGE_KEY = 'userPreferences';

// Default preferences
const DEFAULT_PREFERENCES = {
    hideButtons: false,
    accessibility: {
        textSize: 'default',
        contrast: 'normal',
        motion: 'all',
        colorMode: 'normal',
        screenReader: false,
        keyboardNav: false,
        voiceNav: false
    }
};

// Helper function to safely get stored preferences
const getStoredPreferences = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_PREFERENCES;
        
        const parsed = JSON.parse(stored);
        return {
            ...DEFAULT_PREFERENCES,
            ...parsed,
            accessibility: {
                ...DEFAULT_PREFERENCES.accessibility,
                ...(parsed.accessibility || {})
            }
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
};

// Helper function to safely store preferences
const storePreferences = (prefs) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
        console.warn('Failed to save preferences:', error);
    }
};

export function UserPreferencesProvider({ children }) {
    const [preferences, setPreferences] = useState(() => getStoredPreferences());

    // Apply preferences to DOM
    const applyPreferences = (prefs) => {
        const { accessibility } = prefs;
        
        // Remove existing classes
        const classesToRemove = [
            'text-size-default', 'text-size-large', 'text-size-extra-large',
            'contrast-normal', 'contrast-high', 'contrast-maximum',
            'color-mode-normal', 'color-mode-deuteranopia', 'color-mode-protanopia', 'color-mode-tritanopia'
        ];
        
        document.documentElement.classList.remove(...classesToRemove);

        // Add new classes
        document.documentElement.classList.add(
            `text-size-${accessibility.textSize.replace(' ', '-')}`,
            `contrast-${accessibility.contrast}`,
            `color-mode-${accessibility.colorMode}`
        );
    };

    // Apply preferences whenever they change
    useEffect(() => {
        applyPreferences(preferences);
        storePreferences(preferences);
    }, [preferences]);

    // Load preferences on mount
    useEffect(() => {
        const storedPrefs = getStoredPreferences();
        setPreferences(storedPrefs);
        applyPreferences(storedPrefs);
    }, []);

    const updatePreference = (key, value) => {
        setPreferences(prev => {
            const newPrefs = { ...prev, [key]: value };
            storePreferences(newPrefs);
            return newPrefs;
        });
    };

    const updateAccessibility = (key, value) => {
        setPreferences(prev => {
            const newPrefs = {
                ...prev,
                accessibility: {
                    ...prev.accessibility,
                    [key]: value
                }
            };
            storePreferences(newPrefs);
            return newPrefs;
        });
    };

    const resetToDefaults = () => {
        setPreferences(DEFAULT_PREFERENCES);
        storePreferences(DEFAULT_PREFERENCES);
        applyPreferences(DEFAULT_PREFERENCES);
    };

    return (
        <UserPreferencesContext.Provider value={{
            preferences,
            updatePreference,
            updateAccessibility,
            resetToDefaults
        }}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferences() {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
} 