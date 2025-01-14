import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';

function PaymentFailed() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const error = params.get('error') || 'Payment was not successful';

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                                <XCircleIcon className="h-10 w-10 text-red-500" />
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                Payment Failed
                            </h2>
                            <p className="mt-2 text-center text-gray-600">
                                {error}
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <button
                                onClick={() => window.history.back()}
                                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default PaymentFailed; 