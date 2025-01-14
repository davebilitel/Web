import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { formatCurrency } from '../utils/currency';
import Toast from './ui/Toast';
import VisaCardFlip from './VisaCardFlip';
import BackgroundEffect from './BackgroundEffect';
import { ChevronDownIcon, StarIcon, StarIcon as StarSolidIcon, ShieldCheckIcon, LockClosedIcon, CreditCardIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import confetti from 'canvas-confetti';
import { useSpring, animated } from 'react-spring';

function VisaCard() {
    // State declarations
    const navigate = useNavigate();
    const cardFee = 1;
    const [customBalance, setCustomBalance] = useState('2');
    const [showToast, setShowToast] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [savedAmount, setSavedAmount] = useState(localStorage.getItem('savedAmount'));
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [purchaseStep, setPurchaseStep] = useState(1);
    const [isSticky, setIsSticky] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);

    const quickAmounts = [10, 20, 50, 100];

    const cardVariants = {
        hover: {
            scale: 1.05,
            rotateY: 15,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            transition: { duration: 0.3 }
        },
        initial: {
            scale: 1,
            rotateY: 0,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }
    };

    // Add this new spring animation
    const glowSpring = useSpring({
        from: { opacity: 0 },
        to: {
            opacity: isHovered ? 0.8 : 0.4,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        },
        config: { tension: 200, friction: 20 }
    });

    // Add these new elements for floating animations
    const floatingElements = [
        {
            id: 1,
            icon: <LockClosedIcon className="w-6 h-6 text-blue-500" />,
            delay: 0,
            position: { top: '20%', left: '15%' }
        },
        {
            id: 2,
            icon: <ShieldCheckIcon className="w-6 h-6 text-purple-500" />,
            delay: 1,
            position: { top: '40%', left: '75%' }
        },
        {
            id: 3,
            icon: <CreditCardIcon className="w-6 h-6 text-indigo-500" />,
            delay: 2,
            position: { top: '70%', left: '25%' }
        }
    ];

    // Add animation variants
    const floatingVariants = {
        initial: (delay) => ({
            opacity: 0,
            scale: 0.5,
            y: 20,
            x: 0,
        }),
        animate: (delay) => ({
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.4, 1],
            y: [0, -30, 0],
            x: [0, 20, 0],
            transition: {
                duration: 4,
                delay: delay * 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        })
    };

    const chipAnimation = {
        initial: { scale: 1, rotate: 0 },
        animate: {
            scale: [1, 1.15, 1],
            rotate: [0, 5, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        }
    };

    const logoAnimation = {
        initial: { opacity: 0.8, y: 0 },
        animate: {
            opacity: [0.8, 1, 0.8],
            y: [-2, 2, -2],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        }
    };

    // Add new shimmer animation
    const shimmerVariants = {
        initial: {
            x: '-100%',
            opacity: 0,
        },
        animate: {
            x: '100%',
            opacity: [0, 0.5, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
            }
        }
    };

    // Handlers
    const handlePurchase = () => {
        const balance = parseFloat(customBalance);
        if (isNaN(balance) || balance < 2) {
            setShowToast(true);
            return;
        }
        
        navigate('/pay', {
            state: {
                cardType: 'VISA',
                balanceUSD: balance,
                feeUSD: cardFee
            }
        });
    };

    const handleBalanceChange = (e) => {
        const value = e.target.value;
        setCustomBalance(value);
        if (showToast && parseFloat(value) >= 2) {
            setShowToast(false);
        }
        // Trigger confetti when a valid amount is entered
        if (parseFloat(value) >= 2) {
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.6 },
                colors: ['#1a1f71', '#1434cb', '#0052ff']
            });
        }
    };

    const handleQuickAmountSelect = (amount) => {
        setCustomBalance(amount.toString());
        // Trigger haptic feedback
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
        // Trigger confetti effect with Visa colors
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1a1f71', '#1434cb', '#0052ff']  // Visa blues
        });
    };

    const handleSaveAmount = () => {
        const amount = parseFloat(customBalance);
        if (!isNaN(amount) && amount >= 2) {
            localStorage.setItem('savedAmount', customBalance);
            setSavedAmount(customBalance);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
            if (window.navigator.vibrate) {
                window.navigator.vibrate([50, 50, 50]);
            }
        }
    };

    // Data
    const faqs = [
        {
            question: "How quickly can I use my virtual card?",
            answer: "Your Visa virtual card is available instantly after purchase. You can start making online payments immediately."
        },
        {
            question: "Where can I use this virtual card?",
            answer: "The card can be used for online purchases anywhere Visa is accepted worldwide, including major e-commerce platforms and digital services."
        },
        {
            question: "Is my card information secure?",
            answer: "Yes, your card is protected by Visa's advanced security features, including 3D Secure authentication and real-time fraud monitoring."
        },
        {
            question: "Can I top up my card balance later?",
            answer: "Yes, you can easily top up your card balance anytime through our secure payment portal using various payment methods."
        }
    ];

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setIsSticky(offset > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkEnabled = () => {
            const enabled = localStorage.getItem('visaCardEnabled') !== 'false';
            setIsEnabled(enabled);
        };
        
        checkEnabled();
        
        // Listen for changes to localStorage
        window.addEventListener('storage', checkEnabled);
        return () => window.removeEventListener('storage', checkEnabled);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-gray-50 
            dark:from-dark-bg-primary dark:to-dark-bg-secondary">
            {/* Update background overlay */}
            <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-3xl" />
            </div>

            <BackgroundEffect />

            {/* Main Card Section */}
            <div className="relative max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent 
                    bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
                     Visa Cards
                </h1>

                <motion.div
                    className="bg-white/80 dark:bg-dark-bg-tertiary/80 backdrop-blur-sm rounded-2xl 
                        shadow-2xl overflow-hidden border border-white/20 dark:border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="md:flex">
                        {/* Card Preview */}
                        <div className="md:w-2/5 p-8 lg:p-12 relative">
                            <div className="relative">
                                <animated.div
                                    style={glowSpring}
                                    className="absolute inset-0 -m-4 rounded-3xl"
                                >
                                    {/* Multiple gradient layers for rich glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 blur-2xl rounded-3xl" />
                                    <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/20 to-indigo-600/20 blur-xl rounded-3xl" />
                                    {isFlipped && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-2xl rounded-3xl" />
                                    )}
                                </animated.div>
                                
                                <motion.div
                                    className="perspective-1000 relative z-10"
                                    animate={isFlipped ? { rotateY: 180 } : { rotateY: 0 }}
                                    transition={{ duration: 0.6 }}
                                    onHoverStart={() => setIsHovered(true)}
                                    onHoverEnd={() => setIsHovered(false)}
                                    variants={cardVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    onClick={() => setIsFlipped(!isFlipped)}
                                >
                                    {/* Floating Elements */}
                                    {!isFlipped && (
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            {/* Shimmer Effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                                                variants={shimmerVariants}
                                                initial="initial"
                                                animate="animate"
                                            />
                                            
                                            {floatingElements.map((element) => (
                                                <motion.div
                                                    key={element.id}
                                                    className="absolute"
                                                    style={element.position}
                                                    custom={element.delay}
                                                    variants={floatingVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                >
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg 
                                                        border border-white/30 hover:bg-white/30 transition-colors duration-300"
                                                    >
                                                        {element.icon}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Card Chip Animation */}
                                    <motion.div
                                        className="absolute top-1/3 left-16 w-14 h-14"
                                        variants={chipAnimation}
                                        initial="initial"
                                        animate="animate"
                                    >
                                        <div className="w-full h-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 
                                            rounded-md backdrop-blur-sm border border-yellow-400/30 shadow-lg"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent" />
                                        </div>
                                    </motion.div>

                                    {/* Visa Logo Animation */}
                                    <motion.div
                                        className="absolute bottom-8 right-8"
                                        variants={logoAnimation}
                                        initial="initial"
                                        animate="animate"
                                    >
                                        <div className="text-white text-3xl font-bold tracking-wider 
                                            bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                                        >
                                            VISA
                                        </div>
                                    </motion.div>

                                    <VisaCardFlip 
                                        isFlipped={isFlipped}
                                        balance={formatCurrency(parseFloat(customBalance || 0))}
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="md:w-3/5 p-8 lg:p-12">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {/* Quick Amount Selection */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                                            Initial Card Balance (Minimum $2)
                                        </label>
                                        <button
                                            onClick={handleSaveAmount}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                                            data-tooltip-id="save-tooltip"
                                            data-tooltip-content="Save this amount for later"
                                        >
                                            {savedAmount === customBalance ? (
                                                <StarSolidIcon className="h-5 w-5" />
                                            ) : (
                                                <StarIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative mt-2">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <span className="text-gray-500 dark:text-gray-400 text-xl">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="2"
                                            step="0.01"
                                            value={customBalance}
                                            onChange={handleBalanceChange}
                                            onFocus={() => setInputFocused(true)}
                                            onBlur={() => setInputFocused(false)}
                                            className="block w-full text-2xl py-5 rounded-lg border border-gray-300 
                                                dark:border-gray-600 pl-8 pr-12 bg-white/50 dark:bg-dark-bg-secondary/50 
                                                text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 
                                                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                                transition-all duration-200"
                                            placeholder="Enter amount"
                                            data-tooltip-id="min-amount-tooltip"
                                            data-tooltip-content="Minimum amount is $2"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                            <span className="text-gray-500 dark:text-gray-400 text-xl">USD</span>
                                        </div>
                                    </div>

                                    {/* Quick Amount Selection */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                                            Quick Select Amount
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {quickAmounts.map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => handleQuickAmountSelect(amount)}
                                                    className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                                                        parseFloat(customBalance) === amount
                                                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-900 dark:text-gray-200'
                                                    }`}
                                                >
                                                    ${amount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Service Fee */}
                                <div className="flex items-center justify-between mb-6 text-base text-gray-600 dark:text-gray-300">
                                    <span className="flex items-center">
                                        Service Fee
                                        <span className="ml-1 text-blue-500 dark:text-blue-400 cursor-help">ⓘ</span>
                                    </span>
                                    <span>{formatCurrency(cardFee)}</span>
                                </div>

                                {/* Total Amount */}
                                <div className="flex items-center justify-between mb-8 text-lg font-semibold 
                                    text-gray-900 dark:text-gray-100">
                                    <span>Total Amount:</span>
                                    <span>{formatCurrency(parseFloat(customBalance || 0) + cardFee)}</span>
                                </div>

                                {/* Purchase Button */}
                                <button
                                    onClick={handlePurchase}
                                    disabled={!isEnabled}
                                    className={`w-full ${
                                        isEnabled 
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    } text-white text-lg py-4 px-8 rounded-lg transition-all duration-200 shadow-lg`}
                                >
                                    {isEnabled ? 'Purchase Card' : 'Card Purchases Temporarily Disabled'}
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Benefits Section */}
            <section className="max-w-6xl mx-auto px-4 mb-16">
                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        {
                            icon: <CreditCardIcon className="w-8 h-8" />,
                            title: "Virtual Card",
                            description: "Instant digital card issuance"
                        },
                        {
                            icon: <ShieldCheckIcon className="w-8 h-8" />,
                            title: "Secure Payments",
                            description: "Protected by Visa's 3D Secure"
                        },
                        {
                            icon: <LockClosedIcon className="w-8 h-8" />,
                            title: "Fraud Protection",
                            description: "24/7 fraud monitoring"
                        },
                        {
                            icon: <CheckCircleIcon className="w-8 h-8" />,
                            title: "Global Acceptance",
                            description: "Use anywhere online"
                        }
                    ].map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-xl shadow-lg"
                        >
                            <div className="text-blue-600 mb-4">{benefit.icon}</div>
                            <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                            <p className="text-gray-600">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            

            {/* FAQ Accordion */}
            <section className="max-w-6xl mx-auto px-4 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md">
                            <button
                                className="w-full px-6 py-4 text-left flex justify-between items-center"
                                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                            >
                                <span className="font-medium">{faq.question}</span>
                                <ChevronDownIcon 
                                    className={`w-5 h-5 transform transition-transform ${
                                        openFaqIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <AnimatePresence>
                                {openFaqIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 py-4 text-gray-600 border-t">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tooltips */}
            <Tooltip id="save-tooltip" />
            <Tooltip id="min-amount-tooltip" />
            <Tooltip id="fee-tooltip" />

            {/* Toast Messages */}
            <Toast 
                message="Minimum balance is $2"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <AnimatePresence>
                {showSaveSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
                    >
                        Amount saved successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Summary Panel */}
            <AnimatePresence>
                {isSticky && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-bg-tertiary/80 
                            backdrop-blur-sm shadow-lg border-t border-gray-200 dark:border-gray-800 z-50"
                    >
                        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                    Total: {formatCurrency(parseFloat(customBalance || 0) + cardFee)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    (includes {formatCurrency(cardFee)} fee)
                                </span>
                            </div>
                            <button
                                onClick={handlePurchase}
                                disabled={!isEnabled}
                                className={`${
                                    isEnabled 
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                } text-white px-8 py-3 rounded-lg transition-all duration-200 shadow-lg`}
                            >
                                {isEnabled ? 'Purchase Card' : 'Purchases Disabled'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default VisaCard; 