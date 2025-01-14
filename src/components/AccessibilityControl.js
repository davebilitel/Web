import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import AccessibilityMenu from './ui/AccessibilityMenu';
import { useUserPreferences } from '../context/UserPreferencesContext';

function AccessibilityControl() {
    const [showA11yMenu, setShowA11yMenu] = useState(false);
    const { preferences, updatePreference } = useUserPreferences();

    const toggleButtons = () => {
        try {
            updatePreference('hideButtons', !preferences.hideButtons);
        } catch (error) {
            console.warn('Error toggling buttons:', error);
        }
    };

    return (
        <>
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed bottom-36 left-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg
                          hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                onClick={() => setShowA11yMenu(true)}
                aria-label="Accessibility Settings"
            >
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-white fill-white stroke-white" />
            </motion.button>

            <AccessibilityMenu 
                isOpen={showA11yMenu} 
                onClose={() => setShowA11yMenu(false)}
                onToggleButtons={toggleButtons}
                hideButtons={preferences.hideButtons}
            />
        </>
    );
}

export default AccessibilityControl; 