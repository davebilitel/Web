import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', isVisible, onClose, autoDismiss = 5000 }) => {
    const icons = {
        success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        error: <XCircleIcon className="h-6 w-6 text-red-500" />,
        warning: <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />
    };

    const backgrounds = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200'
    };

    const textColors = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-yellow-800'
    };

    React.useEffect(() => {
        if (isVisible && autoDismiss) {
            const timer = setTimeout(onClose, autoDismiss);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoDismiss, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-4 right-4 z-50"
                >
                    <div className={`flex items-center p-4 rounded-lg border ${backgrounds[type]} shadow-lg max-w-md`}>
                        <div className="flex-shrink-0">{icons[type]}</div>
                        <div className={`ml-3 ${textColors[type]} font-medium`}>{message}</div>
                        <button
                            onClick={onClose}
                            className="ml-8 text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast; 