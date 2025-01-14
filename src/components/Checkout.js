import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { convertToLocalCurrency, formatCurrency, getCurrencyCode } from '../utils/currency';

// Add Toast component
const Toast = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 5000); // Auto hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cardType, balanceUSD, feeUSD } = location.state || {};
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country: ''
    });

    // Calculate local currency amounts when country changes
    const [localAmounts, setLocalAmounts] = useState({
        cardBalance: balanceUSD,
        fee: feeUSD,
        total: balanceUSD + feeUSD,
        currencyCode: 'USD'
    });

    useEffect(() => {
        if (formData.country) {
            const cardBalance = convertToLocalCurrency(balanceUSD, formData.country);
            const fee = convertToLocalCurrency(feeUSD, formData.country);
            setLocalAmounts({
                cardBalance,
                fee,
                total: cardBalance + fee,
                currencyCode: getCurrencyCode(formData.country)
            });
        } else {
            // Reset to USD when no country is selected
            setLocalAmounts({
                cardBalance: balanceUSD,
                fee: feeUSD,
                total: balanceUSD + feeUSD,
                currencyCode: 'USD'
            });
        }
    }, [formData.country, balanceUSD, feeUSD]);

    if (!cardType || !balanceUSD) {
        navigate('/');
        return null;
    }

    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUssdModal, setShowUssdModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [toast, setToast] = useState({
        message: '',
        isVisible: false
    });

    useEffect(() => {
        if (formData.country === 'SN' || formData.country === 'BF' || formData.country === 'CI' || 
            formData.country === 'RW' || formData.country === 'UG') {
            setPaymentMethod('FLUTTERWAVE');
        } else {
            setPaymentMethod('');
        }
    }, [formData.country]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Only validate phone number format for CAMPAY
            if (paymentMethod === 'CAMPAY' && formData.country === 'CM') {
                const phoneRegex = /^[0-9]{9}$/;  // Expects exactly 9 digits
                if (!phoneRegex.test(formData.phone)) {
                    setToast({
                        message: "For Cameroon Mobile Money, please enter a valid 9-digit phone number (e.g., 67XXXXXXX)",
                        isVisible: true
                    });
                    setLoading(false);
                    return;
                }
            }

            const response = await axios.post('/api/orders', {
                cardType,
                amount: localAmounts.total,
                currency: localAmounts.currencyCode,
                paymentMethod,
                ...formData
            });

            console.log('Payment response:', response.data);

            if (paymentMethod === 'CAMPAY') {
                if (response.data.ussd_code) {
                    setPaymentInfo({
                        ussdCode: response.data.ussd_code,
                        operator: response.data.operator,
                        reference: response.data.reference
                    });
                    setShowUssdModal(true);
                } else if (response.data.payment_url) {
                    window.location.href = response.data.payment_url;
                } else {
                    throw new Error('Invalid payment response');
                }
            } else if (paymentMethod === 'FLUTTERWAVE') {
                const FlutterwaveCheckout = window.FlutterwaveCheckout;
                if (!FlutterwaveCheckout) {
                    throw new Error('Flutterwave not initialized');
                }

                // Update currency selection based on country
                const getCurrency = (country) => {
                    switch (country) {
                        case 'CM':
                            return 'XAF';
                        case 'RW':
                            return 'RWF';
                        case 'UG':
                            return 'UGX';
                        case 'KE':
                            return 'KES';
                        case 'SN':
                        case 'BF':
                        case 'CI':
                            return 'XOF';
                        default:
                            return 'XAF';
                    }
                };

                const currency = getCurrency(formData.country);
                let paymentComplete = false;

                const paymentConfig = {
                    public_key: response.data.public_key,
                    tx_ref: response.data.tx_ref,
                    amount: localAmounts.total,
                    currency: currency,
                    payment_options: getPaymentOptions(formData.country),
                    meta: {
                        order_id: response.data.order_id,
                        country: formData.country
                    },
                    customer: {
                        email: formData.email,
                        phone_number: formData.phone,
                        name: formData.name,
                    },
                    customizations: {
                        title: "Virtual Card Purchase",
                        description: `Purchase of ${cardType} virtual card`,
                        logo: "https://your-logo-url.com/logo.png",
                    },
                    callback: function(response) {
                        console.log('Flutterwave callback:', response);
                        paymentComplete = true;
                        verifyPayment(response.transaction_id);
                    },
                    onclose: function() {
                        setLoading(false);
                        if (!paymentComplete) {
                            setError('Payment was cancelled');
                        }
                    }
                };

                // Add specific configurations based on country
                if (['SN', 'BF', 'CI'].includes(formData.country)) {
                    paymentConfig.payment_options = "mobilemoney";
                    paymentConfig.network = "wave";
                } else if (formData.country === 'RW') {
                    paymentConfig.payment_options = "mobilemoneyrw";
                } else if (formData.country === 'UG') {
                    paymentConfig.payment_options = "mobilemoneyuganda";
                } else if (formData.country === 'KE') {
                    paymentConfig.payment_options = "mpesa";
                }

                FlutterwaveCheckout(paymentConfig);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            let errorMessage = 'Failed to initialize payment. Please try again.';
            
            // Handle specific error messages for CAMPAY
            if (paymentMethod === 'CAMPAY' && error.response?.data?.message === 'Invalid phone number') {
                errorMessage = 'Please enter a valid Cameroon phone number (e.g., 67XXXXXXX)';
            } else if (error.response?.data) {
                errorMessage = error.response.data.message || error.response.data.error || errorMessage;
            }

            setToast({
                message: errorMessage,
                isVisible: true
            });
            setLoading(false);
        }
    };

    const verifyPayment = async (transactionId) => {
        try {
            console.log('Verifying payment:', transactionId);
            const response = await axios.post('/api/verify-payment', {
                transactionId,
                paymentMethod
            });
            
            console.log('Verification response:', response.data);

            if (response.data.status === 'success') {
                navigate('/success');
            } else {
                console.error('Payment verification failed:', response.data.message);
                navigate('/failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            navigate('/failed');
        }
    };

    const UssdModal = ({ isOpen, onClose, ussdCode, operator, reference }) => {
        const navigate = useNavigate();
        const [checking, setChecking] = useState(false);
        const [checkCount, setCheckCount] = useState(0);
        const [statusMessage, setStatusMessage] = useState('');

        useEffect(() => {
            let intervalId;

            const checkPaymentStatus = async () => {
                try {
                    setChecking(true);
                    console.log('Checking payment status for reference:', reference);
                    
                    const response = await axios.get(`/api/payment-status/${reference}`);
                    console.log('Status check response:', response.data);
                    
                    const status = response.data.status.toUpperCase();
                    
                    if (status === 'SUCCESSFUL') {
                        console.log('Payment successful, navigating to success page');
                        clearInterval(intervalId);
                        setStatusMessage('Payment successful! Redirecting...');
                        setTimeout(() => navigate('/success'), 2000);
                    } else if (status === 'FAILED') {
                        console.log('Payment failed, navigating to failed page');
                        clearInterval(intervalId);
                        setStatusMessage('Payment failed! Redirecting...');
                        setTimeout(() => navigate('/failed'), 2000);
                    } else if (status === 'PENDING') {
                        setStatusMessage(`Payment pending... (Attempt ${checkCount + 1}/20)`);
                        if (checkCount >= 20) {
                            clearInterval(intervalId);
                            setChecking(false);
                            setStatusMessage('Payment status check timed out. Please check your transaction history.');
                        }
                        setCheckCount(prev => prev + 1);
                    }
                } catch (error) {
                    console.error('Status check error:', error);
                    setStatusMessage('Error checking payment status');
                    setChecking(false);
                }
            };

            if (isOpen && reference) {
                // Initial check
                checkPaymentStatus();
                // Then check every 6 seconds
                intervalId = setInterval(checkPaymentStatus, 6000);
            }

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }, [isOpen, reference, navigate]);

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
                    <div className="space-y-4">
                        <p>Please dial the USSD code below on your {operator} phone:</p>
                        <div className="text-2xl font-mono text-center bg-gray-100 p-4 rounded">
                            {ussdCode}
                        </div>
                        <p className="text-sm text-gray-600">
                            After dialing, follow the prompts to complete your payment.
                        </p>
                        {checking && (
                            <div className="text-center text-sm text-gray-600">
                                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                                {statusMessage}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Add helper function to determine payment options
    const getPaymentOptions = (country) => {
        switch (country) {
            case 'CM':
                return "card,mobilemoney,ussd";
            case 'RW':
                return "mobilemoneyrw";
            case 'UG':
                return "mobilemoneyuganda";
            case 'KE':
                return "mpesa";
            default:
                return "mobilemoney";
        }
    };

    // Add a helper function to get payment method description
    const getPaymentMethodDescription = (country) => {
        switch (country) {
            case 'CM':
                return "Pay with Mobile Money, Card or Bank Transfer";
            case 'KE':
                return "Pay with M-PESA or Airtel Money";
            case 'UG':
                return "Pay with MTN Mobile Money or Airtel Money";
            case 'RW':
                return "Pay with MTN Mobile Money";
            case 'BF':
                return "Pay with Mobi Cash or Orange Money";
            case 'CI':
                return "Pay with Moov, MTN, Orange Money or Wave";
            case 'SN':
                return "Pay with E-money, Orange Money, Free Money or Wave";
            default:
                return "Pay with Mobile Money";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-lg"
                    >
                        {/* Header */}
                        <div className="border-b px-8 py-4">
                            <h2 className="text-2xl font-bold">Secure Checkout</h2>
                        </div>

                        <div className="p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column - Order Details */}
                                <div>
                                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>Card Type:</span>
                                                <span className="font-medium">{cardType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Card Balance:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(balanceUSD)}
                                                    {formData.country && (
                                                        <span className="ml-2">
                                                            ({formatCurrency(localAmounts.cardBalance, formData.country)})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Service Fee:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(feeUSD)}
                                                    {formData.country && (
                                                        <span className="ml-2">
                                                            ({formatCurrency(localAmounts.fee, formData.country)})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-3 border-t">
                                                <span>Total Amount:</span>
                                                <span>
                                                    {formatCurrency(balanceUSD + feeUSD)}
                                                    {formData.country && (
                                                        <span className="ml-2">
                                                            ({formatCurrency(localAmounts.total, formData.country)})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Selection - Only show if country is selected */}
                                    {formData.country && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                                            <div className="space-y-3">
                                                {formData.country === 'CM' && (
                                                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value="CAMPAY"
                                                            checked={paymentMethod === 'CAMPAY'}
                                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                                            className="mr-3"
                                                        />
                                                        <div>
                                                            <div className="font-medium">Campay</div>
                                                            <div className="text-sm text-gray-500">Pay with Mobile Money</div>
                                                        </div>
                                                    </label>
                                                )}
                                                
                                                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="FLUTTERWAVE"
                                                        checked={paymentMethod === 'FLUTTERWAVE'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="mr-3"
                                                    />
                                                    <div>
                                                        <div className="font-medium">Flutterwave</div>
                                                        <div className="text-sm text-gray-500">
                                                            {getPaymentMethodDescription(formData.country)}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* If no country is selected, show a message */}
                                    {!formData.country && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                                            <p className="text-gray-600">
                                                Please select a country to view available payment methods
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Customer Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                Country
                                            </label>
                                            <select
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    country: e.target.value
                                                }))}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select a country</option>
                                                <option value="CM">Cameroon</option>
                                                <option value="SN">Senegal</option>
                                                <option value="BF">Burkina Faso</option>
                                                <option value="CI">Côte d'Ivoire</option>
                                                <option value="RW">Rwanda</option>
                                                <option value="UG">Uganda</option>
                                                <option value="KE">Kenya</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    name: e.target.value
                                                }))}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>

                                        {error && (
                                            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || !formData.country || !paymentMethod}
                                            className={`w-full py-4 rounded-lg text-white font-semibold text-lg ${
                                                loading || !formData.country || !paymentMethod
                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {loading ? 'Processing...' : 
                                                !formData.country ? 'Select a country to continue' :
                                                !paymentMethod ? 'Select a payment method' :
                                                `Pay ${formatCurrency(localAmounts.total, formData.country)}`
                                            }
                                        </button>
                                    </form>

                                    {/* Security Notice */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Secure Payment
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Your payment information is encrypted and secure. We never store your card details.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            <UssdModal
                isOpen={showUssdModal}
                onClose={() => setShowUssdModal(false)}
                ussdCode={paymentInfo?.ussdCode}
                operator={paymentInfo?.operator}
                reference={paymentInfo?.reference}
            />

            {/* Add Toast component at the bottom */}
            <Toast 
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

export default Checkout; 