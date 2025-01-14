import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Failed() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100 mb-6"
                    >
                        <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('payment.failed.title')}</h2>
                    <p className="text-gray-600 mb-8">
                        {t('payment.failed.message')}
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            {t('common.tryAgain')}
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            {t('common.contactSupport')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Failed; 