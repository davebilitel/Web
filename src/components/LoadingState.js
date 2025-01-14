import React from 'react';
import { motion } from 'framer-motion';

function LoadingState() {
    return (
        <motion.div
            className="absolute inset-0 bg-white/80 dark:bg-dark-bg-tertiary/80 
                backdrop-blur-sm rounded-2xl flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent
                    rounded-full animate-spin"
                />
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                    Loading your card...
                </p>
            </div>
        </motion.div>
    );
}

export default LoadingState; 