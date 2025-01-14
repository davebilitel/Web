import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function TopUpFailed() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('error') || 'Payment verification failed';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
                >
                    <div className="text-center">
                        <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Payment Failed
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            {errorMessage}
                        </p>
                        <div className="mt-6 space-y-4">
                            <Link
                                to="/top-up"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Try Again
                            </Link>
                            <Link
                                to="/"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Return Home
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default TopUpFailed; 