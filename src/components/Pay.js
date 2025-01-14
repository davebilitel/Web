import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { convertToLocalCurrency, formatCurrency, getCurrencyCode, getCurrencyFromCountry } from '../utils/currency';
import UssdModal from './UssdModal';
import { maskEmail } from '../utils/maskEmail';
import { CreditCardIcon, DevicePhoneMobileIcon, ShieldCheckIcon, LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import ReactCountryFlag from 'react-country-flag';
import { useScript } from '../hooks/useScript';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Import shared components
import Toast from './ui/Toast';
import PaymentMethodCard from './PaymentMethodCard';
import SecurityBadges from './SecurityBadges';
import FloatingSummary from './FloatingSummary';
import { getSmartErrorMessage, QueuedRequestsManager, isValidEmail } from '../services/ErrorHandlingService';

const FloatingButton = ({ onClick, disabled }) => (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:hidden z-40">
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                disabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
            Continue to Payment
        </button>
    </div>
);

const BottomSheetHandle = () => (
    <div className="flex justify-center mb-4">
        <div className="w-16 h-1.5 rounded-full bg-gray-300/80 hover:bg-gray-300 transition-colors" />
    </div>
);

const PaymentHeader = ({ amount, currency, country }) => (
    <div className="mb-6 border-b border-gray-200 pb-6 pt-2 sticky top-0 bg-white shadow-sm">
        <div className="text-sm text-gray-500 mb-1">Total Amount</div>
        <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(amount, country)}
            </div>
            <div className="text-sm text-gray-500">
                ≈ ${amount.toFixed(2)} USD
            </div>
        </div>
    </div>
);

const ErrorMessage = ({ error, formData, onRetry, onEdit, onChangeMethod }) => {
    if (!error) return null;
    
    const smartError = getSmartErrorMessage(error, formData);

    return (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700 font-medium">
                        {smartError.message}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                        {smartError.suggestion}
                    </p>
                    <div className="mt-2">
                        {smartError.action === 'retry' && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="text-sm text-red-700 hover:text-red-600 font-medium"
                            >
                                Try again
                            </button>
                        )}
                        {smartError.action === 'edit' && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="text-sm text-red-700 hover:text-red-600 font-medium"
                            >
                                Edit details
                            </button>
                        )}
                        {smartError.action === 'change_method' && (
                            <button
                                type="button"
                                onClick={onChangeMethod}
                                className="text-sm text-red-700 hover:text-red-600 font-medium"
                            >
                                Try another method
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function Pay() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cardType, balanceUSD, feeUSD } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country: ''
    });
    const [localAmounts, setLocalAmounts] = useState({
        amount: 0,
        currencyCode: 'USD'
    });
    const [showUssdModal, setShowUssdModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [toast, setToast] = useState({
        message: '',
        isVisible: false
    });
    const [flutterwaveReady, setFlutterwaveReady] = useState(false);
    const [showPaymentSheet, setShowPaymentSheet] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [retryCount, setRetryCount] = useState(0);
    const [emailError, setEmailError] = useState('');
    
    const flutterwaveStatus = useScript('https://checkout.flutterwave.com/v3.js');

    useEffect(() => {
        if (flutterwaveStatus === 'ready') {
            setFlutterwaveReady(true);
        }
    }, [flutterwaveStatus]);

    useEffect(() => {
        return () => {
            if (window.FlutterwaveCheckout) {
                window.FlutterwaveCheckout.close();
            }
        };
    }, []);

    // Redirect if no card type is selected
    useEffect(() => {
        if (!cardType) {
            navigate('/');
            return;
        }
    }, [cardType, navigate]);

    // Update local amounts when country changes
    useEffect(() => {
        if (formData.country && balanceUSD) {
            const localAmount = convertToLocalCurrency(parseFloat(balanceUSD), formData.country);
            setLocalAmounts({
                amount: localAmount,
                currencyCode: getCurrencyFromCountry(formData.country)
            });
        }
    }, [formData.country, balanceUSD]);

    // Set payment method based on country
    useEffect(() => {
        if (formData.country === 'SN' || formData.country === 'BF' || formData.country === 'CI' || 
            formData.country === 'RW' || formData.country === 'UG') {
            setPaymentMethod('FLUTTERWAVE');
        } else if (formData.country === 'CM') {
            setPaymentMethod('CAMPAY');
        } else {
            setPaymentMethod('');
        }
    }, [formData.country]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOnline) {
            QueuedRequestsManager.process();
        }
    }, [isOnline]);

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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        // Validate email format
        if (!formData.email?.trim() || !isValidEmail(formData.email.trim())) {
            setError({
                response: {
                    status: 422,
                    data: { error: 'CardOrder validation failed: customerEmail: Invalid email format' }
                }
            });
            setLoading(false);
            return;
        }

        if (!navigator.onLine) {
            QueuedRequestsManager.add({
                action: () => handleSubmit(),
                data: { formData, cardType, localAmounts, paymentMethod }
            });
            setError(new Error('offline'));
            setLoading(false);
            return;
        }

        // Validate required fields
        if (!formData.email?.trim()) {
            setError('CardOrder validation failed: customerEmail: Path `customerEmail` is required.');
            setLoading(false);
            return;
        }
        if (!formData.name?.trim()) {
            setError('CardOrder validation failed: customerName: Path `customerName` is required.');
            setLoading(false);
            return;
        }
        if (!formData.phone?.trim()) {
            setError('CardOrder validation failed: customerPhone: Path `customerPhone` is required.');
            setLoading(false);
            return;
        }

        try {
            // Validate phone number for Cameroon
            if (paymentMethod === 'CAMPAY' && formData.country === 'CM') {
                let phoneNumber = formData.phone.replace(/\D/g, '');
                
                if (!phoneNumber.startsWith('237')) {
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

                if (phoneNumber.length !== 12) {
                    setToast({
                        message: "Invalid phone number format. Use format: 237670000000",
                        isVisible: true
                    });
                    setLoading(false);
                    return;
                }

                formData.phone = phoneNumber;
            }

            console.log('Submitting payment:', {
                cardType,
                amount: localAmounts.amount,
                currency: localAmounts.currencyCode,
                paymentMethod,
                ...formData
            });

            const response = await axios.post('/api/card-orders', {
                cardType,
                amount: localAmounts.amount,
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
                    
                    // Start polling for payment status
                    const pollPaymentStatus = setInterval(async () => {
                        try {
                            const statusResponse = await axios.post('/api/verify-payment', {
                                orderId: response.data.order_id,
                                reference: response.data.reference,
                                paymentMethod: 'CAMPAY'
                            });
                            
                            if (statusResponse.data.status === 'success') {
                                clearInterval(pollPaymentStatus);
                                try {
                                    console.log('Sending payment receipt email...');
                                    const receiptResponse = await axios.post('/api/email/send-receipt', {
                                        email: formData.email,
                                        name: formData.name,
                                        orderDetails: {
                                            cardType: cardType,
                                            amount: localAmounts.amount,
                                            currency: localAmounts.currencyCode,
                                            reference: response.data.reference,
                                            paymentMethod: 'CAMPAY',
                                            transactionId: statusResponse.data.operator_reference || response.data.code,
                                            paymentDate: new Date().toISOString(),
                                            phone: formData.phone,
                                            country: formData.country
                                        }
                                    });
                                    
                                    console.log('Receipt email response:', receiptResponse.data);
                                    
                                    if (!receiptResponse.data.success) {
                                        console.warn('Receipt email failed:', receiptResponse.data.error);
                                    }
                                } catch (emailError) {
                                    console.error('Failed to send email receipt:', emailError);
                                }
                                
                                window.location.href = `/payment-success?reference=${response.data.reference}`;
                            } else if (statusResponse.data.status === 'failed') {
                                clearInterval(pollPaymentStatus);
                                window.location.href = `/payment-failed?error=${encodeURIComponent(statusResponse.data.message || 'Payment failed')}`;
                            }
                        } catch (error) {
                            console.error('Payment status check failed:', error);
                            clearInterval(pollPaymentStatus);
                            window.location.href = `/payment-failed?error=${encodeURIComponent('Failed to verify payment status')}`;
                        }
                    }, 5000);

                    // Clear interval after 5 minutes
                    setTimeout(() => {
                        clearInterval(pollPaymentStatus);
                    }, 300000);

                } else if (response.data.payment_url) {
                    window.location.href = response.data.payment_url;
                }
            } 
            // Handle Flutterwave payment
            else if (paymentMethod === 'FLUTTERWAVE') {
                if (!flutterwaveReady) {
                    console.log('Flutterwave Status:', flutterwaveStatus);
                    setToast({
                        message: 'Payment system is still initializing. Please wait a moment and try again.',
                        isVisible: true,
                        type: 'warning'
                    });
                    setLoading(false);
                    return;
                }

                const FlutterwaveCheckout = window.FlutterwaveCheckout;
                if (!FlutterwaveCheckout) {
                    throw new Error('Flutterwave not properly initialized');
                }

                // Log the configuration for debugging
                console.log('Flutterwave Config:', {
                    public_key: response.data.public_key,
                    tx_ref: response.data.tx_ref,
                    amount: localAmounts.amount,
                    currency: localAmounts.currencyCode
                });

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
                        title: `${cardType} Card Purchase`,
                        description: `Purchase new ${cardType} virtual card`,
                        logo: 'https://your-logo-url.com/logo.png',
                    },
                    callback: async function(response) {
                        if (response.status === "successful") {
                            try {
                                await axios.post('/api/email/send-receipt', {
                                    email: formData.email,
                                    name: formData.name,
                                    orderDetails: {
                                        cardType: cardType,
                                        amount: localAmounts.amount,
                                        currency: localAmounts.currencyCode,
                                        reference: response.tx_ref,
                                        paymentMethod: 'FLUTTERWAVE',
                                        transactionId: response.transaction_id || response.flw_ref,
                                        paymentDate: new Date().toISOString(),
                                        phone: formData.phone,
                                        country: formData.country
                                    }
                                });

                                window.location.href = `/payment-success?transaction_id=${response.transaction_id}&order_id=${response.tx_ref}`;
                            } catch (emailError) {
                                console.error('Failed to send email receipt:', emailError);
                                window.location.href = `/payment-success?transaction_id=${response.transaction_id}&order_id=${response.tx_ref}`;
                            }
                        } else {
                            window.location.href = `/payment-failed?error=${encodeURIComponent('Payment was not successful')}`;
                        }
                    },
                    onclose: function() {
                        setLoading(false);
                        if (!window.location.href.includes('/payment-success')) {
                            window.location.href = `/payment-failed?error=${encodeURIComponent('Payment was cancelled')}`;
                        }
                    }
                };

                try {
                    FlutterwaveCheckout(config);
                } catch (flwError) {
                    console.error('Flutterwave initialization error:', flwError);
                    throw new Error('Failed to initialize payment form');
                }
            }
        } catch (error) {
            console.error('Payment Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            setError(error.response?.data?.error || error.message || 'Failed to process payment');
            setLoading(false);
        }
    };

    const checkFormValidity = () => {
        // Only check if country is selected
        const isValid = Boolean(formData.country);
        setIsFormValid(isValid);
        return isValid;
    };

    const handleFormChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        
        // Check form validity after any change
        setTimeout(() => {
            checkFormValidity();
        }, 0);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (checkFormValidity()) {
            setShowPaymentSheet(true);
        }
    };

    const validateEmail = (email) => {
        if (!email.trim()) {
            setEmailError('Email is required');
            return false;
        }
        if (!isValidEmail(email.trim())) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                            {/* Card Details Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
                                <h2 className="text-3xl font-bold text-white mb-6">Purchase {cardType} Card</h2>
                                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                                    <div className="grid grid-cols-2 gap-6 text-white">
                                        <div>
                                            <p className="text-white/70 text-sm">Card Type</p>
                                            <p className="font-medium">{cardType}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-sm">Initial Balance</p>
                                            <p className="font-medium">${balanceUSD}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="p-8">
                                <form onSubmit={handleFormSubmit} className="space-y-6">
                                    {/* Country Selection */}
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                            Country
                                        </label>
                                        <select
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) => handleFormChange('country', e.target.value)}
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
                                        </select>
                                    </div>

                                    {/* Personal Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                id="full-name"
                                                name="full-name"
                                                autoComplete="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => handleFormChange('name', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    autoComplete="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        const newEmail = e.target.value;
                                                        handleFormChange('email', newEmail);
                                                        validateEmail(newEmail);
                                                    }}
                                                    onBlur={(e) => validateEmail(e.target.value)}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                                        emailError ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {emailError && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {emailError}
                                                    </p>
                                                )}
                                                {formData.email && !emailError && (
                                                    <div className="absolute right-3 top-2.5 text-green-500">
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                            {formData.country && (
                                                <span className="inline-flex items-center ml-2">
                                                    <ReactCountryFlag
                                                        countryCode={formData.country}
                                                        svg
                                                        className="mr-1"
                                                        style={{
                                                            width: '1.2em',
                                                            height: '1.2em',
                                                        }}
                                                    />
                                                    {formData.country === 'CM' && (
                                                        <span className="text-xs text-gray-500">
                                                            (Format: 237XXXXXXXXX)
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                autoComplete="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    const formatted = formatPhoneNumber(e.target.value, formData.country);
                                                    handleFormChange('phone', formatted);
                                                }}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pl-12"
                                                placeholder={formData.country === 'CM' ? '237XXXXXXXXX' : 'Enter phone number'}
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Payment Methods - hide on mobile */}
                                    <div className="hidden lg:block space-y-6">
                                        {/* Payment Methods */}
                                        {formData.country && (
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-4">
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

                                        {/* Desktop Submit Button */}
                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={loading || !paymentMethod}
                                                className={`w-full py-3.5 px-4 rounded-xl text-white font-medium ${
                                                    loading || !paymentMethod
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                } transition-colors duration-200`}
                                            >
                                                {loading ? 'Processing...' : 
                                                    !paymentMethod ? 'Select payment method' :
                                                    `Pay ${formatCurrency(localAmounts.amount, formData.country)}`
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                {/* Security Badges */}
                                <SecurityBadges />
                            </div>
                        </motion.div>
                    </div>

                    {/* Floating Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 max-h-screen overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            <FloatingSummary 
                                amount={balanceUSD}
                                fee={feeUSD}
                                paymentMethod={paymentMethod}
                                cardDetails={{
                                    type: cardType,
                                    cardNumber: 'New Card'
                                }}
                                localAmount={{
                                    ...localAmounts,
                                    country: formData.country
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* USSD Modal */}
            <UssdModal
                isOpen={showUssdModal}
                onClose={() => setShowUssdModal(false)}
                ussdCode={paymentInfo?.ussdCode}
                operator={paymentInfo?.operator}
                reference={paymentInfo?.reference}
            />

            {/* Toast */}
            <Toast 
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Mobile Payment Sheet */}
            <Transition.Root show={showPaymentSheet} as={React.Fragment}>
                <Dialog 
                    as="div" 
                    className="relative z-50 lg:hidden" 
                    onClose={setShowPaymentSheet}
                >
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gradient-to-b from-gray-600/70 to-gray-800/80 backdrop-blur-[2px] transition-all duration-300" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-t-2xl bg-white px-6 sm:px-8 pb-8 pt-4 text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-lg sm:p-6 h-[85vh] sm:h-auto">
                                    <BottomSheetHandle />
                                    
                                    <div className="absolute right-0 top-2 pr-6 pt-4">
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 transition-colors"
                                            onClick={() => setShowPaymentSheet(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6 overflow-y-auto h-full pb-20 px-1">
                                        <PaymentHeader 
                                            amount={localAmounts.amount} 
                                            currency={localAmounts.currencyCode}
                                            country={formData.country}
                                        />
                                        
                                        <ErrorMessage 
                                            error={error}
                                            formData={formData}
                                            onRetry={() => {
                                                setError('');
                                                handleSubmit();
                                            }}
                                            onEdit={() => setShowPaymentSheet(false)}
                                            onChangeMethod={() => setPaymentMethod('')}
                                        />
                                        
                                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                            Select Payment Method
                                        </Dialog.Title>
                                        
                                        {/* Payment Methods with proper spacing */}
                                        <div className="space-y-3 -mx-1">
                                            {formData.country === 'CM' && (
                                                <div className="sm:transform-none transform scale-[0.95]">
                                                    <PaymentMethodCard
                                                        method="CAMPAY"
                                                        selected={paymentMethod === 'CAMPAY'}
                                                        onSelect={setPaymentMethod}
                                                        country={formData.country}
                                                    />
                                                </div>
                                            )}
                                            <div className="sm:transform-none transform scale-[0.95]">
                                                <PaymentMethodCard
                                                    method="FLUTTERWAVE"
                                                    selected={paymentMethod === 'FLUTTERWAVE'}
                                                    onSelect={setPaymentMethod}
                                                    country={formData.country}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Button - Now with consistent padding */}
                                    <div className="fixed bottom-0 left-0 right-0 p-4 sm:px-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading || !paymentMethod}
                                            className={`w-full py-3.5 px-4 rounded-xl text-white font-medium ${
                                                loading || !paymentMethod
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            } transition-colors duration-200`}
                                        >
                                            {loading ? 'Processing...' : 
                                                !paymentMethod ? 'Select payment method' :
                                                `Pay ${formatCurrency(localAmounts.amount, formData.country)}`
                                            }
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <FloatingButton 
                onClick={() => setShowPaymentSheet(true)} 
                disabled={!isFormValid} 
            />
        </div>
    );
}

export default Pay; 