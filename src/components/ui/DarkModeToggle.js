import React from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../hooks/useDarkMode';

function DarkModeToggle() {
    const [isDarkMode, setIsDarkMode] = useDarkMode();

    return (
        <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-200 dark:bg-blue-600 transition-colors duration-300"
            role="switch"
            aria-checked={isDarkMode}
        >
            <span className="sr-only">Toggle dark mode</span>
            <motion.span
                initial={false}
                animate={{
                    x: isDarkMode ? 20 : 2,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="inline-block w-5 h-5 transform rounded-full bg-white shadow"
            >
                {isDarkMode ? (
                    <span className="absolute inset-0 flex items-center justify-center text-xs">🌙</span>
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xs">☀️</span>
                )}
            </motion.span>
        </button>
    );
}

export default DarkModeToggle; 