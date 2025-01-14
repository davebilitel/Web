import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function TopUpSuccess() {
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = queryParams.get('reference');
            const orderId = queryParams.get('order_id');
            const transactionId = queryParams.get('transaction_id');
            const status = queryParams.get('status');

            console.log('Verification Parameters:', { reference, orderId, transactionId, status });

            if (!reference && !orderId) {
                navigate('/top-up-failed?error=Missing transaction information');
                return;
            }

            try {
                const response = await axios.post('/api/verify-top-up-payment', {
                    reference,
                    orderId,
                    transactionId,
                    paymentMethod: transactionId ? 'FLUTTERWAVE' : 'CAMPAY'
                });

                if (response.data.status === 'success') {
                    setStatus('success');
                    return;
                }
                
                navigate(`/top-up-failed?error=${encodeURIComponent(response.data.message || 'Payment verification failed')}`);
            } catch (error) {
                console.error('Verification error:', error);
                navigate(`/top-up-failed?error=${encodeURIComponent(error.response?.data?.error || 'Failed to verify payment')}`);
            }
        };

        verifyPayment();
    }, [queryParams, navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Verifying Payment...
                </h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
                >
                    {status === 'success' ? (
                        <div className="text-center">
                            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                Payment Successful!
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Your card has been topped up successfully.
                            </p>
                            <div className="mt-6 space-y-4">
                                <Link
                                    to="/balance"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Check Balance
                                </Link>
                                <Link
                                    to="/"
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Return Home
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                Payment Failed
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                {error || 'Something went wrong with your payment.'}
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
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default TopUpSuccess; 