import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Toast({ message, isVisible, onClose, type = 'error' }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
                >
                    <div className={`px-6 py-3 rounded-lg shadow-lg ${
                        type === 'error' ? 'bg-red-500' : 'bg-green-500'
                    } text-white flex items-center space-x-2`}>
                        <span>{message}</span>
                        <button 
                            onClick={onClose}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Toast; 