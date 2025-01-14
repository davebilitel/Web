import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Card3D from './Card3D';
import { triggerConfetti } from '../utils/confetti';
import BottomDrawer from './ui/BottomDrawer';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBalanceTimer } from '../hooks/useBalanceTimer';
import { ClockIcon, QuestionMarkCircleIcon, EnvelopeIcon, CreditCardIcon as VisaIcon, CreditCardIcon as MastercardIcon } from '@heroicons/react/24/outline';
import BackgroundEffect from './BackgroundEffect';

function Balance({ isDrawer, setIsBalanceDrawerOpen }) {
    const [cardId, setCardId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardDetails, setCardDetails] = useState(null);
    const [verificationStep, setVerificationStep] = useState('verify');
    const [showPopup, setShowPopup] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isOnCooldown, timeRemaining, setLastCheckTime } = useBalanceTimer();
    const [showCooldownPopup, setShowCooldownPopup] = useState(false);
    
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setCardDetails(null);
        setLoading(true);

        try {
            const response = await axios.post('/api/cards/verify-id', { cardId });
            setCardDetails(response.data);
            setVerificationStep('verified');
            triggerConfetti();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to verify card ID');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckBalance = async () => {
        if (isOnCooldown) {
            setShowCooldownPopup(true);
            setTimeout(() => setShowCooldownPopup(false), 3000);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/cards/check-balance', { cardId });
            
            if (response.data.status === 'PENDING') {
                setLastCheckTime(); // Start the cooldown
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 5000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to fetch balance');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (isDrawer) {
            setIsBalanceDrawerOpen(false);
        }
    };

    const handleCardNavigation = (cardType) => {
        if (isDrawer && setIsBalanceDrawerOpen) {
            setIsBalanceDrawerOpen(false);
            setTimeout(() => {
                navigate(`/${cardType}`);
            }, 300);
        } else {
            navigate(`/${cardType}`);
        }
    };

    const renderErrorGuidance = () => {
        return (
            <div className="rounded-xl bg-red-50 p-4 space-y-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Card ID not found
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>We couldn't find a card with this ID. Please double-check the number and try again.</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-white/50 rounded-lg p-4">
                        <div className="flex items-center text-blue-700">
                            <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Check your email for your card ID</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Your card ID was sent to your email when you activated your card
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-3">
                            Don't have a card?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleCardNavigation('visa')}
                                className="flex flex-col items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors group"
                            >
                                <VisaIcon className="h-6 w-6 mb-1 text-blue-600" />
                                <span>Get Visa Card</span>
                            </button>
                            <button
                                onClick={() => handleCardNavigation('mastercard')}
                                className="flex flex-col items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white rounded-lg border-2 border-gray-200 hover:border-red-500 hover:text-red-600 transition-colors group"
                            >
                                <MastercardIcon className="h-6 w-6 mb-1 text-red-600" />
                                <span>Get Mastercard</span>
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-600 text-center">
                            Get your new card in minutes
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const cooldownPopup = (
        <AnimatePresence>
            {showCooldownPopup && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-xl z-50"
                >
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                                Please wait before checking again
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Time remaining: {timeRemaining}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const checkBalanceButton = (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckBalance}
            disabled={loading || isOnCooldown}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition-colors duration-200"
        >
            {loading ? (
                <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking Balance...</span>
                </span>
            ) : isOnCooldown ? (
                <span className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5" />
                    <span>Wait {timeRemaining}</span>
                </span>
            ) : (
                'Check Balance'
            )}
        </motion.button>
    );

    const content = (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Check Card Balance</h2>
                <p className="mt-2 text-gray-600">Enter your card ID to verify and check balance</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6"
            >
                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label htmlFor="cardId" className="block text-sm font-medium text-gray-700">
                            Card ID
                        </label>
                        <div className="mt-1">
                            <input
                                id="cardId"
                                name="cardId"
                                type="text"
                                required
                                value={cardId}
                                onChange={(e) => setCardId(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl"
                                placeholder="Enter your card ID"
                                disabled={verificationStep === 'verified'}
                            />
                        </div>
                    </div>

                    {error && renderErrorGuidance()}

                    {verificationStep === 'verify' && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-6 text-lg border border-transparent rounded-lg shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Verifying...' : 'Verify ID'}
                        </button>
                    )}
                </form>

                {cardDetails && verificationStep === 'verified' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-8 space-y-6"
                    >
                        <div className="flex justify-center px-4 sm:px-0 mb-6">
                            <Card3D cardDetails={cardDetails} />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl space-y-4 shadow-lg">
                            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600 font-medium">Email</span>
                                <span className="font-medium text-gray-800 px-3 py-1 bg-gray-50 rounded-md">
                                    {cardDetails.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600 font-medium">Status</span>
                                <span className={`px-3 py-1 rounded-md font-medium ${
                                    cardDetails.status === 'ACTIVE' 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {cardDetails.status}
                                </span>
                            </div>

                            {cardDetails.balance !== undefined && (
                                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                                    <span className="text-gray-600 font-medium">Balance</span>
                                    <span className="text-lg font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                                        ${cardDetails.balance.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {checkBalanceButton}
                    </motion.div>
                )}
            </motion.div>

            {/* Success Popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-4 right-4 bg-white p-6 rounded-xl shadow-xl max-w-md"
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Balance Check Request Sent
                                </h3>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Your balance will be sent to your email shortly. This usually takes about a minute.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="ml-4 text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {cooldownPopup}
        </div>
    );

    // Render as drawer on mobile when opened from sticky actions
    if (isDrawer) {
        return content;
    }

    // Regular render for desktop or direct URL access
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white 
            dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-primary">
            <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-3xl" />
            </div>

            <BackgroundEffect />

            <div className="relative max-w-6xl mx-auto px-4 py-12">
            <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
                    >
                        <div className="sm:mx-auto sm:w-full sm:max-w-md">
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                                Check Card Balance
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                                Enter your card ID to verify and check balance
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="mt-8 space-y-6">
                            <div>
                                <label htmlFor="cardId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Card ID
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="cardId"
                                        name="cardId"
                                        type="text"
                                        required
                                        value={cardId}
                                        onChange={(e) => setCardId(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-600 
                                            rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                            placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Enter your card ID"
                                        disabled={verificationStep === 'verified'}
                                    />
                                </div>
                            </div>

                            {error && renderErrorGuidance()}

                            {verificationStep === 'verify' && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-6 text-lg border border-transparent rounded-lg shadow-sm 
                                        font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 
                                        dark:focus:ring-offset-gray-800"
                                >
                                    {loading ? 'Verifying...' : 'Verify ID'}
                                </button>
                            )}
                        </form>

                        {cardDetails && verificationStep === 'verified' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mt-8 space-y-6"
                            >
                                <div className="flex justify-center px-4 sm:px-0 mb-6">
                                    <Card3D cardDetails={cardDetails} />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl space-y-4 shadow-lg">
                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <span className="text-gray-600 dark:text-gray-300 font-medium">Email</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-md">
                                            {cardDetails.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <span className="text-gray-600 dark:text-gray-300 font-medium">Status</span>
                                        <span className={`px-3 py-1 rounded-md font-medium ${
                                            cardDetails.status === 'ACTIVE' 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                        }`}>
                                            {cardDetails.status}
                                        </span>
                                    </div>

                                    {cardDetails.balance !== undefined && (
                                        <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">Balance</span>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                                                ${cardDetails.balance.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {checkBalanceButton}
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Loading overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
                        >
                            <div className="flex flex-col items-center space-y-4">
                                <motion.div
                                    animate={{ 
                                        rotate: 360,
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ 
                                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 1, repeat: Infinity }
                                    }}
                                    className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"
                                />
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                                    Verifying Card...
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Success Popup */}
                <AnimatePresence>
                    {showPopup && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md"
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        Balance Check Request Sent
                                    </h3>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>Your balance will be sent to your email shortly. This usually takes about a minute.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="ml-4 text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {cooldownPopup}
            </div>
        </div>
    );
}

export default Balance; 