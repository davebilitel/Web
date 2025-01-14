import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCardIcon, 
    ArrowUpCircleIcon, 
    EyeIcon, 
    EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { prefetchRoute } from '../utils/prefetch';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { toast } from 'react-hot-toast';
import TopUp from './TopUp';
import Balance from './Balance';
import BottomDrawer from './ui/BottomDrawer';

function StickyActions() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);
    const { preferences, updatePreference } = useUserPreferences();
    const [showA11yMenu, setShowA11yMenu] = useState(false);
    const [isTopUpDrawerOpen, setIsTopUpDrawerOpen] = useState(false);
    const [isBalanceDrawerOpen, setIsBalanceDrawerOpen] = useState(false);

    // List of paths where sticky buttons should not appear
    const excludedPaths = [
        '/admin',
        '/admin/login',
        '/admin/dashboard',
        '/top-up-checkout',
        '/pay',
        '/visa',
        '/mastercard'
    ];

    // Check if current path should show sticky buttons
    const shouldShowButtons = useCallback(() => {
        return !excludedPaths.some(path => location.pathname.startsWith(path));
    }, [location.pathname]);

    // Check for low-performance device
    useEffect(() => {
        const checkDevicePerformance = () => {
            const isLowEnd = !window.matchMedia('(min-device-memory: 4)').matches || 
                           navigator.hardwareConcurrency <= 4;
            setIsLowPerfDevice(isLowEnd);
        };

        checkDevicePerformance();
    }, []);

    // Preload routes and components
    useEffect(() => {
        prefetchRoute('/balance');
        prefetchRoute('/top-up');
    }, []);

    // Optimized haptic feedback
    const triggerHaptic = useCallback(() => {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(50);
            } catch (e) {
                console.warn('Haptic feedback failed:', e);
            }
        }
    }, []);

    const handleButtonClick = useCallback((route) => {
        triggerHaptic();
        if (route === '/top-up') {
            setIsTopUpDrawerOpen(true);
        } else if (route === '/balance') {
            setIsBalanceDrawerOpen(true);
        }
    }, [triggerHaptic]);

    // Optimized animation variants
    const containerVariants = {
        initial: { y: 100, opacity: 0 },
        animate: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: isLowPerfDevice ? "tween" : "spring",
                stiffness: isLowPerfDevice ? undefined : 300,
                damping: isLowPerfDevice ? undefined : 30,
                duration: isLowPerfDevice ? 0.2 : undefined
            }
        }
    };

    const buttonVariants = {
        hover: isLowPerfDevice ? {} : { scale: 1.02 },
        tap: { scale: 0.95 }
    };

    const iconVariants = {
        hover: isLowPerfDevice ? {} : {
            rotate: 15,
            transition: { type: "spring", stiffness: 400 }
        }
    };

    const toggleButtons = useCallback(() => {
        try {
            triggerHaptic();
            updatePreference('hideButtons', !preferences.hideButtons);
        } catch (error) {
            console.warn('Error toggling buttons:', error);
        }
    }, [triggerHaptic, updatePreference, preferences.hideButtons]);

    // Get color scheme based on accessibility preferences and dark mode
    const getColorScheme = () => {
        const { highContrast, colorBlindMode } = preferences.accessibility;
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        if (highContrast) {
            return {
                balance: {
                    bg: isDarkMode ? 'bg-gray-800' : 'bg-black',
                    text: 'text-white',
                    hover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-800'
                },
                topup: {
                    bg: isDarkMode ? 'bg-gray-700' : 'bg-white',
                    text: isDarkMode ? 'text-white' : 'text-black',
                    hover: isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }
            };
        }

        // Restore original colors for light mode
        return {
            balance: {
                bg: isDarkMode ? 'bg-dark-bg-secondary' : 'bg-blue-600',
                text: 'text-white',
                hover: isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-blue-700',
                gradient: isDarkMode ? 'from-blue-400/10 via-white/20 to-blue-400/10' : 'from-blue-500/10 via-white/20 to-blue-500/10'
            },
            topup: {
                bg: isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-green-600',
                text: 'text-white',
                hover: isDarkMode ? 'hover:bg-dark-hover' : 'hover:bg-green-700',
                gradient: isDarkMode ? 'from-green-400/10 via-white/20 to-green-400/10' : 'from-green-500/10 via-white/20 to-green-500/10'
            }
        };
    };

    // Animation variants based on reduced motion preference
    const getAnimationVariants = () => {
        if (preferences.accessibility.reducedMotion) {
            return {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            };
        }
        return containerVariants;
    };

    // Get text size class based on preference
    const getTextSize = () => {
        return preferences.accessibility.largeText ? 'text-lg' : 'text-base';
    };

    // Keyboard navigation
    const handleKeyPress = useCallback((e, action) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    }, []);

    // Voice navigation setup
    useEffect(() => {
        if (preferences.accessibility.voiceNav && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                if (command.includes('check balance')) {
                    handleButtonClick('/balance');
                } else if (command.includes('top up')) {
                    handleButtonClick('/top-up');
                } else if (command.includes('hide quick actions') || command.includes('hide buttons')) {
                    toggleButtons();
                } else if ((command.includes('show quick actions') || command.includes('show buttons')) && preferences.hideButtons) {
                    toggleButtons();
                }
            };

            // Add voice command listener
            const startListening = (e) => {
                if (e.ctrlKey && e.key === 'v') {
                    try {
                        recognition.start();
                        // Optional: Add visual feedback that voice recognition is active
                        toast.info('Voice recognition active...', { duration: 2000 });
                    } catch (e) {
                        console.warn('Voice recognition failed:', e);
                        toast.error('Voice recognition failed to start');
                    }
                }
            };

            window.addEventListener('keydown', startListening);

            return () => {
                recognition.stop();
                window.removeEventListener('keydown', startListening);
            };
        }
    }, [handleButtonClick, preferences.accessibility.voiceNav, preferences.hideButtons]);

    const colorScheme = getColorScheme();
    const animationVariants = getAnimationVariants();
    const textSize = getTextSize();

    // Add drawer animation variants
    const drawerVariants = {
        hidden: { 
            y: "100%",
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 40
            }
        },
        visible: { 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 40
            }
        }
    };

    // Add function to handle checkout navigation
    const handleTopUpCheckout = useCallback((cardDetails, cardId, amount) => {
        // Navigate immediately to trigger URL change
        navigate('/top-up-checkout', { 
            state: { 
                cardDetails,
                cardId,
                amount,
                fromDrawer: true,
                returnToDrawer: true
            }
        });
    }, [navigate]);

    // Add this effect to close the drawer when URL changes to checkout
    useEffect(() => {
        if (location.pathname === '/top-up-checkout') {
            setIsTopUpDrawerOpen(false);
        }
    }, [location.pathname]);

    // Keep the return navigation effect
    useEffect(() => {
        if (location.state?.returnToDrawer && location.pathname !== '/top-up-checkout') {
            setIsTopUpDrawerOpen(true);
        }
    }, [location.state, location.pathname]);

    return (
        <>
            <style>
                {`
                    @keyframes shimmer-balance {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }

                    @keyframes shimmer-topup {
                        0% {
                            transform: translateX(100%) translateY(-100%);
                        }
                        100% {
                            transform: translateX(-100%) translateY(100%);
                        }
                    }

                    @keyframes pulse-balance {
                        0%, 100% {
                            opacity: 0.1;
                        }
                        50% {
                            opacity: 0.3;
                        }
                    }

                    @keyframes pulse-topup {
                        0% {
                            transform: scale(0.95);
                            opacity: 0.1;
                        }
                        50% {
                            transform: scale(1.05);
                            opacity: 0.3;
                        }
                        100% {
                            transform: scale(0.95);
                            opacity: 0.1;
                        }
                    }

                    @keyframes magnetic-stripe {
                        0% {
                            transform: translateX(-100%);
                            background-position: -200% 0;
                        }
                        100% {
                            transform: translateX(100%);
                            background-position: 200% 0;
                        }
                    }

                    @keyframes contactless-ring {
                        0% {
                            transform: scale(1);
                            opacity: 0;
                        }
                        50% {
                            transform: scale(1.3);
                            opacity: 0.3;
                        }
                        100% {
                            transform: scale(1.6);
                            opacity: 0;
                        }
                    }

                    @keyframes contactless-inner {
                        0%, 100% {
                            opacity: 0.2;
                        }
                        50% {
                            opacity: 0.4;
                        }
                    }

                    .shimmer-balance {
                        animation: shimmer-balance 2s infinite linear;
                    }

                    .shimmer-topup {
                        animation: shimmer-topup 2.5s infinite linear;
                    }

                    .pulse-balance {
                        animation: pulse-balance 2s infinite ease-in-out;
                    }

                    .pulse-topup {
                        animation: pulse-topup 3s infinite ease-in-out;
                    }

                    .magnetic-stripe {
                        animation: magnetic-stripe 3s infinite linear;
                        background: repeating-linear-gradient(
                            90deg,
                            transparent,
                            rgba(255, 255, 255, 0.1) 20%,
                            rgba(255, 255, 255, 0.3) 40%,
                            rgba(255, 255, 255, 0.1) 60%,
                            transparent 80%
                        );
                        background-size: 200% 100%;
                        opacity: 0.3;
                    }

                    .magnetic-stripe-container:hover .magnetic-stripe {
                        opacity: 0.8;
                    }

                    .contactless-waves > div {
                        position: absolute;
                        border-radius: 50%;
                        border: 2px solid white;
                        animation: contactless-ring 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                        opacity: 0.3;
                    }

                    .group:hover .contactless-waves > div {
                        opacity: 1;
                    }

                    .contactless-inner {
                        animation: contactless-inner 2s infinite ease-in-out;
                        background: radial-gradient(circle at center, white 0%, transparent 70%);
                    }
                `}
            </style>

            {!preferences.hideButtons && shouldShowButtons() && (
                <motion.div 
                    initial="initial"
                    animate="animate"
                    variants={containerVariants}
                    className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent 
                        dark:from-dark-bg-primary dark:via-dark-bg-primary dark:to-transparent z-40"
                >
                    <div className="max-w-lg mx-auto grid grid-cols-2 gap-4">
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleButtonClick('/balance')}
                            className={`group relative overflow-hidden flex items-center justify-center gap-2 py-4 px-6 
                                rounded-xl shadow-lg transition-all duration-200 ${colorScheme.balance.bg} 
                                ${colorScheme.balance.text} ${colorScheme.balance.hover}`}
                            style={{
                                willChange: 'transform',
                                backfaceVisibility: 'hidden',
                                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            {/* Contactless payment indicator overlay */}
                            <div className="absolute inset-0 w-full h-full transition-opacity duration-300">
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
                                    <div className="contactless-waves">
                                        <div className="w-full h-full" />
                                        <div className="w-full h-full" />
                                        <div className="w-full h-full" />
                                    </div>
                                    <div className="absolute inset-0 contactless-inner" />
                                </div>
                            </div>

                            {/* Button content */}
                            <motion.div variants={iconVariants} className="relative z-10">
                                <CreditCardIcon className="h-6 w-6" />
                            </motion.div>
                            <span className="font-medium relative z-10">Check Balance</span>
                        </motion.button>

                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleButtonClick('/top-up')}
                            className={`magnetic-stripe-container group relative overflow-hidden flex items-center justify-center gap-2 py-4 px-6 
                                rounded-xl shadow-lg transition-all duration-200 ${colorScheme.topup.bg} 
                                ${colorScheme.topup.text} ${colorScheme.topup.hover}`}
                            style={{
                                willChange: 'transform',
                                backfaceVisibility: 'hidden',
                                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            {/* Magnetic stripe overlay */}
                            <div className="absolute inset-0 w-full h-full">
                                <div
                                    className="absolute inset-0 magnetic-stripe"
                                    style={{
                                        height: '40%',
                                        top: '30%',
                                        transition: 'opacity 0.3s ease'
                                    }}
                                />
                            </div>

                            {/* Button content */}
                            <motion.div variants={iconVariants} className="relative z-10">
                                <ArrowUpCircleIcon className="h-6 w-6" />
                            </motion.div>
                            <span className="font-medium relative z-10">Top Up</span>
                        </motion.button>
                    </div>

                    <div className="h-[env(safe-area-inset-bottom)]" />
                </motion.div>
            )}

            {/* Modified Top Up Drawer */}
            <AnimatePresence>
                {isTopUpDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTopUpDrawerOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        />
                        
                        {/* Drawer */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={drawerVariants}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto shadow-xl"
                        >
                            {/* Drawer Handle */}
                            <div className="sticky top-0 left-0 right-0 flex justify-center pt-4 pb-2 bg-white">
                                <div 
                                    className="w-12 h-1 bg-gray-200 rounded-full"
                                    onClick={() => setIsTopUpDrawerOpen(false)}
                                />
                            </div>

                            {/* Top Up Content */}
                            <div className="px-6 pb-6">
                                <TopUp 
                                    isDrawer={true}
                                    onCheckout={handleTopUpCheckout}
                                    drawerStyle={true}
                                    setIsTopUpDrawerOpen={setIsTopUpDrawerOpen}
                                />
                            </div>

                            {/* Safe area spacing */}
                            <div className="h-[env(safe-area-inset-bottom)]" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Balance Drawer */}
            <AnimatePresence>
                {isBalanceDrawerOpen && (
                    <BottomDrawer 
                        isOpen={isBalanceDrawerOpen} 
                        onClose={() => setIsBalanceDrawerOpen(false)}
                    >
                        <Balance 
                            isDrawer={true} 
                            setIsBalanceDrawerOpen={setIsBalanceDrawerOpen} 
                        />
                    </BottomDrawer>
                )}
            </AnimatePresence>
        </>
    );
}

export default StickyActions; 