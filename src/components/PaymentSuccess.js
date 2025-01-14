import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const reference = params.get('reference');
        const transaction_id = params.get('transaction_id');
        const order_id = params.get('order_id');

        if (!reference && !transaction_id && !order_id) {
            navigate('/');
            return;
        }

        // Verify payment status
        const verifyPayment = async () => {
            try {
                const response = await axios.post('/api/verify-payment', {
                    reference,
                    orderId: order_id,
                    transactionId: transaction_id,
                    paymentMethod: transaction_id ? 'FLUTTERWAVE' : 'CAMPAY'
                });

                if (response.data.status === 'success') {
                    setOrderDetails(response.data.order);
                } else {
                    navigate('/payment-failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                navigate('/payment-failed');
            } finally {
                setIsLoading(false);
            }
        };

        verifyPayment();
    }, [location, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

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
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <CheckCircleIcon className="h-10 w-10 text-green-500" />
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                Payment Successful!
                            </h2>
                            <p className="mt-2 text-center text-gray-600">
                                Your card will be created and activated shortly.
                            </p>
                        </div>

                        {orderDetails && (
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <dl className="divide-y divide-gray-200">
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                                        <dd className="text-sm text-gray-900">{orderDetails._id}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                        <dd className="text-sm text-gray-900">
                                            ${orderDetails.amount} {orderDetails.currency}
                                        </dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Card Type</dt>
                                        <dd className="text-sm text-gray-900">{orderDetails.cardType}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
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

export default PaymentSuccess; 