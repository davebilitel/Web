import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function Success() {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('checking');
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const reference = queryParams.get('transaction_id') || queryParams.get('reference');
        
        if (!reference) {
            console.error('No reference found in URL');
            navigate('/');
            return;
        }

        const checkStatus = async () => {
            try {
                const response = await axios.post('http://localhost:5001/api/manual-status-check', {
                    reference,
                    paymentMethod: 'campay'
                });
                
                console.log('Status check response:', response.data);
                
                if (response.data.status === 'SUCCESSFUL' || response.data.status === 'successful') {
                    setStatus('success');
                    setPaymentDetails(response.data);
                } else if (response.data.status === 'FAILED' || response.data.status === 'failed') {
                    navigate('/failed');
                } else {
                    // Keep polling for pending status
                    setTimeout(checkStatus, 3000);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                // Don't redirect on error, keep trying
                setTimeout(checkStatus, 3000);
            }
        };

        checkStatus();
    }, [location.search, navigate]);

    if (status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Payment Successful!
                    </h1>
                    {paymentDetails && (
                        <div className="mt-4 text-left bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Amount:</span> {paymentDetails.amount} {paymentDetails.currency}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Reference:</span> {paymentDetails.reference}
                            </p>
                            {paymentDetails.operator && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Operator:</span> {paymentDetails.operator}
                                </p>
                            )}
                        </div>
                    )}
                    <p className="mt-4 text-gray-600">
                        {error || 'Thank you for your payment. You will be redirected shortly...'}
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Success; 