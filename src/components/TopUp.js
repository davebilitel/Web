import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { maskEmail } from '../utils/maskEmail';
import Card3D from './Card3D';
import RecentTransactions from './RecentTransactions';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { triggerConfetti } from '../utils/confetti';
import { QuestionMarkCircleIcon, PlusCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { CreditCardIcon as VisaIcon, CreditCardIcon as MastercardIcon } from '@heroicons/react/24/solid';
import BackgroundEffect from './BackgroundEffect';

function TopUp({ isDrawer, onCheckout, drawerStyle, setIsTopUpDrawerOpen }) {
    const navigate = useNavigate();
    const [cardId, setCardId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardDetails, setCardDetails] = useState(null);
    const [verificationStep, setVerificationStep] = useState('verify');
    const [selectedAmount, setSelectedAmount] = useState(null);
    const presetAmounts = [10, 20, 50, 100];
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [preferences, setPreferences] = useState({
        lastAmount: null,
        favoriteAmounts: [],
        lastPaymentMethod: null
    });

    const fetchRecentTransactions = async (cardId) => {
        try {
            const response = await axios.get(`/api/recent-transactions/${cardId}`);
            setRecentTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch recent transactions:', error);
        }
    };

    const fetchPreferences = async (cardId) => {
        try {
            const response = await axios.get(`/api/preferences/${cardId}`);
            setPreferences(response.data);
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setCardDetails(null);
        setLoading(true);

        try {
            const response = await axios.post('/api/cards/verify-id', { cardId });
            setCardDetails({
                ...response.data,
                name: response.data.name || response.data.customerName
            });
            setVerificationStep('verified');
            await fetchRecentTransactions(cardId);
            await fetchPreferences(cardId);
            triggerConfetti();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to verify card ID');
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = (amount) => {
        navigate('/top-up-checkout', { 
            state: { 
                cardDetails,
                cardId,
                amount
            }
        });
    };

    const toggleFavorite = async (amount) => {
        try {
            const action = preferences.favoriteAmounts.includes(amount) 
                ? 'removeFavorite' 
                : 'addFavorite';
            
            const response = await axios.post(`/api/preferences/${cardId}`, {
                amount,
                action
            });
            setPreferences(response.data);
        } catch (error) {
            console.error('Failed to update favorites:', error);
        }
    };

    const handleCardNavigation = (cardType) => {
        if (isDrawer && setIsTopUpDrawerOpen) {
            setIsTopUpDrawerOpen(false);
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

    if (drawerStyle) {
        const content = (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Top Up Card</h2>
                    <p className="mt-2 text-gray-600">Enter your card ID to verify and top up</p>
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

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {preferences.lastAmount && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedAmount(preferences.lastAmount)}
                                                className="flex items-center justify-between py-3 px-4 rounded-xl text-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                                            >
                                                <span>Last Amount</span>
                                                <span>${preferences.lastAmount}</span>
                                            </motion.button>
                                        )}

                                        {preferences.favoriteAmounts.map((amount) => (
                                            <motion.button
                                                key={amount}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedAmount(amount)}
                                                className="relative flex items-center justify-between py-3 px-4 rounded-xl text-lg font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                            >
                                                <span>${amount}</span>
                                                <StarSolid 
                                                    className="h-5 w-5 text-yellow-500 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(amount);
                                                    }}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {presetAmounts.map((amount) => (
                                        <motion.button
                                            key={amount}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedAmount(amount)}
                                            className="relative group"
                                        >
                                            <div className={`py-3 px-4 rounded-xl text-lg font-medium ${
                                                selectedAmount === amount
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 border-2 border-gray-200'
                                            }`}>
                                                ${amount}
                                            </div>
                                            {preferences.favoriteAmounts.includes(amount) ? (
                                                <StarSolid 
                                                    className="absolute top-2 right-2 h-5 w-5 text-yellow-500 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(amount);
                                                    }}
                                                />
                                            ) : (
                                                <StarOutline 
                                                    className="absolute top-2 right-2 h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(amount);
                                                    }}
                                                />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Enter custom amount"
                                        value={selectedAmount || ''}
                                        onChange={(e) => setSelectedAmount(parseFloat(e.target.value))}
                                        className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-lg">$</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onCheckout(cardDetails, cardId, selectedAmount)}
                                    disabled={!selectedAmount || selectedAmount <= 0}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                                >
                                    {selectedAmount && selectedAmount > 0
                                        ? `Top Up $${selectedAmount}`
                                        : 'Select an amount'}
                                </button>

                                <RecentTransactions transactions={recentTransactions} />
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        );

        return content;
    }

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
                                Top Up Card
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                                Enter your card ID to verify and top up
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
                                        aria-label="Card ID input"
                                        aria-required="true"
                                        aria-invalid={!!error}
                                        aria-describedby={error ? "card-error" : undefined}
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

                        {verificationStep === 'verified' && cardDetails && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 space-y-6"
                            >
                                <div className="flex justify-center px-4 sm:px-0">
                                    <Card3D cardDetails={cardDetails} />
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {preferences.lastAmount && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedAmount(preferences.lastAmount)}
                                                className="flex items-center justify-between py-3 px-4 rounded-xl text-lg font-medium 
                                                    bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 
                                                    hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                            >
                                                <span>Last Amount</span>
                                                <span>${preferences.lastAmount}</span>
                                            </motion.button>
                                        )}

                                        {preferences.favoriteAmounts.map((amount) => (
                                            <motion.button
                                                key={amount}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedAmount(amount)}
                                                className="relative flex items-center justify-between py-3 px-4 rounded-xl text-lg font-medium 
                                                    bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 
                                                    hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                                            >
                                                <span>${amount}</span>
                                                <StarSolid 
                                                    className="h-5 w-5 text-yellow-500 dark:text-yellow-400 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(amount);
                                                    }}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {presetAmounts.map((amount) => (
                                        <motion.button
                                            key={amount}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedAmount(amount)}
                                            className="relative group"
                                        >
                                            <div className={`py-3 px-4 rounded-xl text-lg font-medium ${
                                                selectedAmount === amount
                                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600'
                                            }`}>
                                                ${amount}
                                            </div>
                                            {preferences.favoriteAmounts.includes(amount) ? (
                                                <StarSolid 
                                                    className="absolute top-2 right-2 h-5 w-5 text-yellow-500 dark:text-yellow-400 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(amount);
                                                    }}
                                                />
                                            ) : (
                                                <StarOutline 
                                                    className="absolute top-2 right-2 h-5 w-5 text-gray-400 dark:text-gray-500 
                                                        opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(amount);
                                                    }}
                                                />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Enter custom amount"
                                        value={selectedAmount || ''}
                                        onChange={(e) => setSelectedAmount(parseFloat(e.target.value))}
                                        className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-600 
                                            rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                            focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400 text-lg">$</span>
                                    </div>
                                </div>

                                {cardDetails.status === 'ACTIVE' && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleTopUp(selectedAmount)}
                                        disabled={!selectedAmount || selectedAmount <= 0}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium transition-colors duration-200 ${
                                            !selectedAmount || selectedAmount <= 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                                        }`}
                                    >
                                        {selectedAmount && selectedAmount > 0
                                            ? `Top Up $${selectedAmount}`
                                            : 'Select an amount'}
                                    </motion.button>
                                )}

                                <RecentTransactions transactions={recentTransactions} />
                            </motion.div>
                        )}
                    </motion.div>
                </div>

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
            </div>
        </div>
    );
}

export default TopUp; 