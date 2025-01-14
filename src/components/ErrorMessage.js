import React from 'react';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';

function ErrorMessage({ message, onRetry }) {
    return (
        <motion.div
            className="absolute inset-0 bg-white/90 dark:bg-dark-bg-tertiary/90 
                backdrop-blur-sm rounded-2xl flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="text-center">
                <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-800 dark:text-gray-200 mb-4">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg
                        hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </motion.div>
    );
}

export default ErrorMessage; 