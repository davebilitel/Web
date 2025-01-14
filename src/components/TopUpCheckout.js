import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { convertToLocalCurrency, formatCurrency, getCurrencyCode } from '../utils/currency';
import UssdModal from './UssdModal';
import { maskEmail } from '../utils/maskEmail';
import { CreditCardIcon, DevicePhoneMobileIcon, ShieldCheckIcon, LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import PaymentMethodCard from './PaymentMethodCard';

// Add Toast component (same as in Checkout.js)
const Toast = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 5000);
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

// Helper function for payment method description
const getPaymentMethodDescription = (country) => {
    switch (country) {
        case 'CM':
            return 'Pay with MTN or Orange Money';
        case 'SN':
        case 'CI':
        case 'BF':
            return 'Pay with Orange Money or Wave';
        case 'RW':
        case 'UG':
            return 'Pay with Mobile Money';
        case 'KE':
            return 'Pay with M-Pesa';
        default:
            return 'Select payment method';
    }
};

// Add this new component for security badges
const SecurityBadges = () => {
    return (
        <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
                <LockClosedIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Secure Payment</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* PCI Compliance Badge */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <ShieldCheckIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-xs font-medium text-center">PCI DSS Compliant</span>
                    <span className="text-xs text-gray-500 text-center">Level 1 Service Provider</span>
                </div>

                {/* SSL Badge */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <LockClosedIcon className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-xs font-medium text-center">SSL Encrypted</span>
                    <span className="text-xs text-gray-500 text-center">256-bit Protection</span>
                </div>

                {/* Fraud Protection */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <CheckBadgeIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-xs font-medium text-center">Fraud Protection</span>
                    <span className="text-xs text-gray-500 text-center">24/7 Monitoring</span>
                </div>

                {/* Payment Guarantee */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mb-2" />
                    <span className="text-xs font-medium text-center">Money-Back Guarantee</span>
                    <span className="text-xs text-gray-500 text-center">100% Secure Transactions</span>
                </div>
            </div>

            {/* Payment Partners */}
            <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-xs text-center text-gray-500 mb-4">Secured & Powered by</p>
                <div className="flex justify-center items-center space-x-6">
                    <img 
                        src="/flutterwave-logo.png" 
                        alt="Flutterwave" 
                        className="h-8 opacity-75 hover:opacity-100 transition-opacity"
                    />
                    <img 
                        src="/campay-logo.png" 
                        alt="Campay" 
                        className="h-8 opacity-75 hover:opacity-100 transition-opacity"
                    />
                </div>
            </div>

            {/* Security Info */}
            <div className="mt-6 text-xs text-gray-500 text-center">
                <p>🔒 Your payment information is encrypted end-to-end</p>
                <p className="mt-1">We never store your card details on our servers</p>
            </div>
        </div>
    );
};

// Update the FloatingSummary component with enhanced visuals
const FloatingSummary = ({ amount, paymentMethod, cardDetails, country }) => {
    const getFee = () => {
        if (!amount) return 0;
        return paymentMethod === 'CAMPAY' ? amount * 0.015 : amount * 0.025;
    };

    const getTotal = () => {
        return Number(amount || 0) + getFee();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-4 bg-white rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl ring-1 ring-gray-200/50 hover:ring-blue-200"
        >
            {/* Card Details Section - Enhanced */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/20">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className={`p-3 rounded-lg transition-colors duration-200 ${
                                cardDetails.type === 'VISA' 
                                    ? 'bg-gradient-to-br from-blue-100 to-blue-50' 
                                    : 'bg-gradient-to-br from-orange-100 to-orange-50'
                            }`}
                        >
                            <CreditCardIcon className={`h-7 w-7 transition-colors ${
                                cardDetails.type === 'VISA' ? 'text-blue-500' : 'text-orange-500'
                            }`} />
                        </motion.div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                            {cardDetails.type} Card
                        </h3>
                        <p className="text-sm text-gray-500 font-mono mt-1 tracking-wider">
                            {cardDetails.cardNumber}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transaction Summary Section - Enhanced */}
            <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50/50 to-white">
                <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                        Transaction Summary
                    </h4>
                    <motion.div 
                        className="space-y-3"
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center group">
                            <span className="text-gray-600">Amount</span>
                            <motion.span
                                key={amount}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-medium text-lg group-hover:text-blue-600 transition-colors"
                            >
                                ${amount || '0.00'}
                            </motion.span>
                        </div>
                        <div className="flex justify-between items-center text-sm group">
                            <span className="text-gray-600">
                                Processing Fee ({paymentMethod === 'CAMPAY' ? '1.5%' : '2.5%'})
                            </span>
                            <motion.span
                                key={getFee()}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-medium group-hover:text-blue-600 transition-colors"
                            >
                                ${getFee().toFixed(2)}
                            </motion.span>
                        </div>
                    </motion.div>
                </div>

                {/* Total Amount Section - Enhanced */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Total</span>
                        <motion.div
                            key={getTotal()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className="text-right transition-all duration-300"
                        >
                            <span className="text-2xl font-bold text-blue-600 drop-shadow-sm">
                                ${getTotal().toFixed(2)}
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* Payment Method Section - Enhanced */}
                {paymentMethod && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-4 border-t border-gray-100"
                    >
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                            Payment Method
                        </h4>
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-lg border border-gray-200/50 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
                        >
                            {paymentMethod === 'CAMPAY' ? (
                                <DevicePhoneMobileIcon className="h-6 w-6 text-orange-500" />
                            ) : (
                                <CreditCardIcon className="h-6 w-6 text-blue-500" />
                            )}
                            <span className="font-medium text-gray-800">
                                {paymentMethod === 'CAMPAY' 
                                    ? 'Pay with MTN or Orange Money' 
                                    : getPaymentMethodDescription(country)}
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

// Add the formatPhoneNumber function
const formatPhoneNumber = (value, country) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    if (country === 'CM') {
        // For Cameroon, ensure it starts with 237
        if (!digits.startsWith('237') && digits.length <= 9) {
            return digits;
        } else if (!digits.startsWith('237') && digits.length > 9) {
            return '237' + digits.slice(-9);
        }
        return digits.slice(0, 12); // Limit to 12 digits (237 + 9 digits)
    }
    
    return digits;
};

function TopUpCheckout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cardDetails, cardId, amount: initialAmount } = location.state || {};
    const [amount, setAmount] = useState(initialAmount || '');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: cardDetails?.name || cardDetails?.customerName || '',
        email: cardDetails?.email || cardDetails?.customerEmail || '',
        phone: '',
        country: ''
    });
    const [localAmounts, setLocalAmounts] = useState({
        amount: 0,
        currencyCode: 'USD'
    });
    const [showUssdModal, setShowUssdModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [toast, setToast] = useState({
        message: '',
        isVisible: false
    });

    useEffect(() => {
        if (cardDetails) {
            setFormData(prev => ({
                ...prev,
                name: cardDetails.name || cardDetails.customerName || '',
                email: cardDetails.email || cardDetails.customerEmail || ''
            }));
        }
    }, [cardDetails]);

    useEffect(() => {
        if (formData.country && amount) {
            const localAmount = convertToLocalCurrency(parseFloat(amount), formData.country);
            setLocalAmounts({
                amount: localAmount,
                currencyCode: getCurrencyCode(formData.country)
            });
        }
    }, [formData.country, amount]);

    useEffect(() => {
        if (formData.country === 'SN' || formData.country === 'BF' || formData.country === 'CI' || 
            formData.country === 'RW' || formData.country === 'UG' || formData.country === 'KE') {
            setPaymentMethod('FLUTTERWAVE');
        } else if (formData.country === 'CM') {
            setPaymentMethod('CAMPAY');
        } else {
            setPaymentMethod('');
        }
    }, [formData.country]);

    if (!cardDetails) {
        navigate('/top-up');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (paymentMethod === 'CAMPAY' && formData.country === 'CM') {
                let phoneNumber = formData.phone.replace(/\D/g, ''); // Remove non-digits
                
                // Check if number starts with '237'
                if (!phoneNumber.startsWith('237')) {
                    // If it's 9 digits, add '237' prefix
                    if (phoneNumber.length === 9) {
                        phoneNumber = '237' + phoneNumber;
                    } else {
                        setToast({
                            message: "For Cameroon Mobile Money, please enter a valid phone number (e.g., 237670000000)",
                            isVisible: true
                        });
                        setLoading(false);
                        return;
                    }
                }

                // Validate the complete number
                if (phoneNumber.length !== 12) { // 237 + 9 digits
                    setToast({
                        message: "Invalid phone number format. Use format: 237670000000",
                        isVisible: true
                    });
                    setLoading(false);
                    return;
                }

                // Update the phone number with the formatted version
                formData.phone = phoneNumber;
            }

            const response = await axios.post('/api/top-up-orders', {
                cardId,
                amount: localAmounts.amount,
                currency: localAmounts.currencyCode,
                paymentMethod,
                ...formData,
                redirect_url: `${window.location.origin}/top-up-success`
            });

            if (paymentMethod === 'CAMPAY') {
                if (response.data.ussd_code) {
                    setPaymentInfo({
                        ussdCode: response.data.ussd_code,
                        operator: response.data.operator,
                        reference: response.data.reference
                    });
                    setShowUssdModal(true);
                    
                    // Start polling for payment status
                    const pollPaymentStatus = setInterval(async () => {
                        try {
                            const statusResponse = await axios.post('/api/verify-top-up-payment', {
                                orderId: response.data.order_id,
                                reference: response.data.reference,
                                paymentMethod: 'CAMPAY'
                            });
                            
                            if (statusResponse.data.status === 'success') {
                                clearInterval(pollPaymentStatus);
                                window.location.href = `/top-up-success?reference=${response.data.reference}`;
                            } else if (statusResponse.data.status === 'failed') {
                                clearInterval(pollPaymentStatus);
                                window.location.href = `/top-up-failed?error=${encodeURIComponent(statusResponse.data.message || 'Payment failed')}`;
                            }
                        } catch (error) {
                            console.error('Payment status check failed:', error);
                            clearInterval(pollPaymentStatus);
                            window.location.href = `/top-up-failed?error=${encodeURIComponent('Failed to verify payment status')}`;
                        }
                    }, 5000); // Check every 5 seconds

                    // Clear interval after 5 minutes (maximum waiting time)
                    setTimeout(() => {
                        clearInterval(pollPaymentStatus);
                    }, 300000);

                } else if (response.data.payment_url) {
                    // For web payment, redirect to the payment URL
                    window.location.href = response.data.redirect_url;
                }
            } else if (paymentMethod === 'FLUTTERWAVE') {
                const FlutterwaveCheckout = window.FlutterwaveCheckout;
                if (!FlutterwaveCheckout) {
                    throw new Error('Flutterwave not initialized');
                }

                const config = {
                    public_key: response.data.public_key,
                    tx_ref: response.data.tx_ref,
                    amount: localAmounts.amount,
                    currency: localAmounts.currencyCode,
                    payment_options: 'card,mobilemoney,ussd',
                    customer: {
                        email: formData.email,
                        phone_number: formData.phone,
                        name: formData.name,
                    },
                    customizations: {
                        title: 'Card Top Up',
                        description: `Top up card ${cardDetails.cardNumber}`,
                        logo: 'https://your-logo-url.com/logo.png',
                    },
                    callback: function(flwResponse) {
                        if (flwResponse.status === 'successful') {
                            const orderId = response.data.tx_ref;
                            window.location.href = `/top-up-success?transaction_id=${flwResponse.transaction_id}&order_id=${orderId}`;
                        } else {
                            window.location.href = `/top-up-failed?error=${encodeURIComponent('Payment was not successful')}`;
                        }
                    },
                    onclose: function() {
                        setLoading(false);
                        if (!window.location.href.includes('/top-up-success')) {
                            window.location.href = `/top-up-failed?error=${encodeURIComponent('Payment was cancelled')}`;
                        }
                    }
                };

                FlutterwaveCheckout(config);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            setToast({
                message: error.response?.data?.error || 'Failed to process payment',
                isVisible: true
            });
            setLoading(false);
        }
    };

    // Add a function to get display value
    const getDisplayEmail = (email) => {
        return maskEmail(email);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
                                <h2 className="text-3xl font-bold text-white mb-6">Card Details</h2>
                                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-white">
                                        <div>
                                            <p className="text-white/70 text-sm">Card Number</p>
                                            <p className="font-mono">{cardDetails.cardNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-sm">Card Type</p>
                                            <p>{cardDetails.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-sm">Card Holder</p>
                                            <p>{cardDetails.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-sm">Email</p>
                                            <p>{getDisplayEmail(cardDetails.email)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-sm">Status</p>
                                            <p className="capitalize">{cardDetails.status.toLowerCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Payment Details
                                        </h3>
                                        
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Top Up Amount (USD)
                                                </label>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 sm:text-sm">$</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                                        placeholder="0.00"
                                                        min="1"
                                                    />
                                                </div>
                                                {formData.country && amount && (
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        ≈ {formatCurrency(localAmounts.amount, formData.country)}
                                                    </p>
                                                )}
                                            </div>

                                            {formData.country && (
                                                <div className="space-y-4">
                                                    <h4 className="font-medium text-gray-900">
                                                        Select Payment Method
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {formData.country === 'CM' && (
                                                            <PaymentMethodCard
                                                                method="CAMPAY"
                                                                selected={paymentMethod === 'CAMPAY'}
                                                                onSelect={setPaymentMethod}
                                                                country={formData.country}
                                                            />
                                                        )}
                                                        <PaymentMethodCard
                                                            method="FLUTTERWAVE"
                                                            selected={paymentMethod === 'FLUTTERWAVE'}
                                                            onSelect={setPaymentMethod}
                                                            country={formData.country}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Customer Information
                                        </h3>
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                <div>
                                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Country
                                                    </label>
                                                    <select
                                                        id="country"
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
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        readOnly
                                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Name must match card holder's name
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={getDisplayEmail(formData.email)}
                                                        readOnly
                                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="hidden"
                                                        value={formData.email}  // Keep the actual email for form submission
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Email must match card holder's email
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Phone Number
                                                        {formData.country === 'CM' && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                (Format: 237XXXXXXXXX)
                                                            </span>
                                                        )}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={formData.phone}
                                                            onChange={(e) => {
                                                                const formatted = formatPhoneNumber(e.target.value, formData.country);
                                                                setFormData({...formData, phone: formatted});
                                                            }}
                                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pl-12"
                                                            placeholder={formData.country === 'CM' ? '237XXXXXXXXX' : 'Enter phone number'}
                                                        />
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    </div>
                                                    {formData.country === 'CM' && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Enter your Cameroon mobile money number starting with 237
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading || !amount || !paymentMethod}
                                                    className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                                                        loading || !amount || !paymentMethod
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-600 hover:bg-blue-700'
                                                    }`}
                                                >
                                                    {loading ? 'Processing...' : 
                                                        !amount ? 'Enter amount to continue' :
                                                        !paymentMethod ? 'Select payment method' :
                                                        `Pay ${formatCurrency(localAmounts.amount, formData.country)}`
                                                    }
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <SecurityBadges />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-4">
                        <FloatingSummary 
                            amount={amount}
                            paymentMethod={paymentMethod}
                            cardDetails={cardDetails}
                            country={formData.country}
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center text-sm text-gray-600 bg-white py-3 px-4 rounded-lg shadow-sm">
                    <LockClosedIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span>
                        Your connection to {window.location.hostname} is secure
                    </span>
                </div>
            </div>

            <UssdModal
                isOpen={showUssdModal}
                onClose={() => setShowUssdModal(false)}
                ussdCode={paymentInfo?.ussdCode}
                operator={paymentInfo?.operator}
                reference={paymentInfo?.reference}
            />

            <Toast 
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

export default TopUpCheckout; 