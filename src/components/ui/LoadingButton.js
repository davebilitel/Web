import React from 'react';
import { motion } from 'framer-motion';

function LoadingButton({ loading, children, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`relative overflow-hidden ${className}`}
        >
            <motion.div
                animate={{
                    opacity: loading ? 0 : 1,
                    y: loading ? 20 : 0
                }}
            >
                {children}
            </motion.div>
            {loading && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </motion.div>
            )}
        </button>
    );
}

export default LoadingButton; 