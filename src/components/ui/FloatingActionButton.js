import React from 'react';
import { motion } from 'framer-motion';

function FloatingActionButton({ icon, onClick, label, position = 'bottom-right' }) {
    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`fixed ${positionClasses[position]} z-50`}
            onClick={onClick}
        >
            <motion.div
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 180 }}
            >
                {icon}
            </motion.div>
            {label && (
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-sm bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                    {label}
                </span>
            )}
        </motion.button>
    );
}

export default FloatingActionButton; 