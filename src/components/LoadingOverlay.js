import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function LoadingOverlay() {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-semibold text-gray-700">{t('common.loading')}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default LoadingOverlay; 