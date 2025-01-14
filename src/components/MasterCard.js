import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/currency';
import Toast from './ui/Toast';
import MasterCardFlip from './MasterCardFlip';
import BackgroundEffect from './BackgroundEffect';
import { ChevronDownIcon, StarIcon, StarIcon as StarSolidIcon, ShieldCheckIcon, LockClosedIcon, CreditCardIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import confetti from 'canvas-confetti';
import { useSpring, animated } from 'react-spring';

function MasterCard() {
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

    const glowSpring = useSpring({
        from: { opacity: 0 },
        to: {
            opacity: isHovered ? 0.6 : 0,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        },
        config: { tension: 200, friction: 20 }
    });

    const floatingElements = [
        {
            id: 1,
            icon: <LockClosedIcon className="w-6 h-6 text-red-500" />,
            delay: 0,
            position: { top: '20%', left: '15%' }
        },
        {
            id: 2,
            icon: <ShieldCheckIcon className="w-6 h-6 text-orange-500" />,
            delay: 1,
            position: { top: '40%', left: '75%' }
        },
        {
            id: 3,
            icon: <CreditCardIcon className="w-6 h-6 text-yellow-500" />,
            delay: 2,
            position: { top: '70%', left: '25%' }
        }
    ];

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

    const handlePurchase = () => {
        const balance = parseFloat(customBalance);
        if (isNaN(balance) || balance < 2) {
            setShowToast(true);
            return;
        }
        
        navigate('/pay', {
            state: {
                cardType: 'MASTERCARD',
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
        if (parseFloat(value) >= 2) {
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.6 },
                colors: ['#ff0000', '#ff4d00', '#ff9900']
            });
        }
    };

    const handleCardFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const faqs = [
        {
            question: "How quickly can I use my virtual card?",
            answer: "Your Mastercard virtual card is available instantly after purchase. You can start making online payments immediately."
        },
        {
            question: "Where can I use this virtual card?",
            answer: "The card can be used for online purchases anywhere Mastercard is accepted worldwide, including major e-commerce platforms and digital services."
        },
        {
            question: "Is my card information secure?",
            answer: "Yes, your card is protected by Mastercard's advanced security features, including 3D Secure authentication and real-time fraud monitoring."
        },
        {
            question: "Can I top up my card balance later?",
            answer: "Yes, you can easily top up your card balance anytime through our secure payment portal using various payment methods."
        }
    ];

    const cardComparison = [
        {
            feature: "Global Acceptance",
            mastercard: "✓",
            visa: "✓",
            other: "Limited"
        },
        {
            feature: "Instant Activation",
            mastercard: "✓",
            visa: "✓",
            other: "Varies"
        },
        {
            feature: "3D Secure",
            mastercard: "✓",
            visa: "✓",
            other: "Limited"
        },
        {
            feature: "Zero Liability Protection",
            mastercard: "✓",
            visa: "✓",
            other: "×"
        }
    ];

    const paymentMethods = [
        { name: "Mobile Money", logo: "/images/mobile-money.png" },
        { name: "Bank Transfer", logo: "/images/bank-transfer.png" },
        { name: "Card Payment", logo: "/images/card-payment.png" }
    ];

    const handleQuickAmountSelect = (amount) => {
        setCustomBalance(amount.toString());
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ff4d00', '#ff9900']
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

    const handleLoadSavedAmount = () => {
        if (savedAmount) {
            setCustomBalance(savedAmount);
            if (window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }
    };

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
            const enabled = localStorage.getItem('masterCardEnabled') !== 'false';
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
            <div className="absolute inset-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 dark:bg-red-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 dark:bg-orange-400/10 rounded-full blur-3xl" />
            </div>

            <BackgroundEffect />

            <div className="relative max-w-6xl mx-auto px-4 py-12">
                <motion.div
                    className="bg-white/80 dark:bg-dark-bg-tertiary/80 backdrop-blur-sm rounded-2xl 
                        shadow-2xl overflow-hidden border border-white/20 dark:border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="md:flex">
                        <div className="md:w-2/5 p-8 lg:p-12 relative">
                            <div className="relative">
                                <animated.div
                                    style={glowSpring}
                                    className="absolute inset-0 -m-4 rounded-3xl transition-opacity duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-orange-500/20 blur-2xl rounded-3xl" />
                                    <div className="absolute inset-0 bg-gradient-to-bl from-orange-400/10 to-yellow-600/10 blur-xl rounded-3xl" />
                                    {isFlipped && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 blur-2xl rounded-3xl" />
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
                                    {!isFlipped && floatingElements.map((element) => (
                                        <motion.div
                                            key={element.id}
                                            className="absolute"
                                            style={element.position}
                                            custom={element.delay}
                                            variants={floatingVariants}
                                            initial="initial"
                                            animate="animate"
                                        >
                                            <div className={`bg-white/10 backdrop-blur-sm rounded-full p-3 shadow-lg 
                                                border border-white/20 transition-all duration-300
                                                ${isHovered ? 'opacity-100 scale-110' : 'opacity-60 scale-100'}`}
                                            >
                                                {element.icon}
                                            </div>
                                        </motion.div>
                                    ))}

                                    <MasterCardFlip 
                                        isFlipped={isFlipped}
                                        balance={formatCurrency(parseFloat(customBalance || 0))}
                                    />
                                </motion.div>
                            </div>
                        </div>

                        <div className="md:w-3/5 p-8 lg:p-12">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                                            Initial Card Balance (Minimum $2)
                                        </label>
                                        <button
                                            onClick={handleSaveAmount}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
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
                                            <span className="text-gray-500 text-xl">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="2"
                                            step="0.01"
                                            value={customBalance}
                                            onChange={handleBalanceChange}
                                            onFocus={() => setInputFocused(true)}
                                            onBlur={() => setInputFocused(false)}
                                            className="block w-full text-2xl py-5 rounded-lg border border-gray-300 pl-8 pr-12 
                                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                            placeholder="Enter amount"
                                            data-tooltip-id="min-amount-tooltip"
                                            data-tooltip-content="Minimum amount is $2"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                            <span className="text-gray-500 text-xl">USD</span>
                                        </div>
                                    </div>

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
                                                            ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-900 dark:text-gray-200'
                                                    }`}
                                                >
                                                    ${amount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6 text-base text-gray-600 dark:text-gray-300">
                                    <span className="flex items-center">
                                        Service Fee
                                        <span
                                            className="ml-1 text-red-500 dark:text-red-400 cursor-help"
                                            data-tooltip-id="fee-tooltip"
                                            data-tooltip-content="A small fee is charged to cover processing costs"
                                        >
                                            ⓘ
                                        </span>
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-200">{formatCurrency(cardFee)}</span>
                                </div>

                                <div className="flex items-center justify-between mb-8 text-lg font-semibold text-gray-900 dark:text-white">
                                    <span>Total Amount:</span>
                                    <span>{formatCurrency(parseFloat(customBalance || 0) + cardFee)}</span>
                                </div>

                                <button
                                    onClick={handlePurchase}
                                    disabled={!isEnabled}
                                    className={`w-full ${
                                        isEnabled 
                                            ? 'bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 hover:from-red-700 hover:to-orange-700 dark:hover:from-red-600 dark:hover:to-orange-600'
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
            <Toast 
                message="Minimum balance is $2"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Mastercard Virtual Card</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Global Acceptance",
                                description: "Use your card anywhere Mastercard is accepted online",
                                icon: "🌎"
                            },
                            {
                                title: "Instant Activation",
                                description: "Start using your card immediately after purchase",
                                icon: "⚡"
                            },
                            {
                                title: "Secure Transactions",
                                description: "Protected by advanced security features",
                                icon: "🔒"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-lg"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Card Comparison</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-lg shadow-lg">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-left">Feature</th>
                                    <th className="px-6 py-4 text-center">Mastercard</th>
                                    <th className="px-6 py-4 text-center">Visa</th>
                                    <th className="px-6 py-4 text-center">Others</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cardComparison.map((row, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="px-6 py-4">{row.feature}</td>
                                        <td className="px-6 py-4 text-center">{row.mastercard}</td>
                                        <td className="px-6 py-4 text-center">{row.visa}</td>
                                        <td className="px-6 py-4 text-center">{row.other}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Accepted Payment Methods</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {paymentMethods.map((method, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                                <img src={method.logo} alt={method.name} className="w-12 h-12 object-contain" />
                                <span className="font-medium">{method.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-16">
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
            </div>

            <Tooltip id="save-tooltip" />
            <Tooltip id="min-amount-tooltip" />
            <Tooltip id="fee-tooltip" />

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

            <div className="max-w-6xl mx-auto px-4 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between">
                        {[
                            { step: 1, label: 'Select Amount' },
                            { step: 2, label: 'Payment' },
                            { step: 3, label: 'Verification' },
                            { step: 4, label: 'Card Ready' }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center relative">
                                <div 
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        purchaseStep >= item.step 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {purchaseStep > item.step ? (
                                        <CheckCircleIcon className="w-6 h-6" />
                                    ) : (
                                        item.step
                                    )}
                                </div>
                                <div className="text-sm mt-2">{item.label}</div>
                                {index < 3 && (
                                    <ArrowRightIcon 
                                        className={`absolute w-4 h-4 right-[-2rem] top-3 ${
                                            purchaseStep > item.step ? 'text-blue-600' : 'text-gray-300'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className="max-w-6xl mx-auto px-4 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Card Benefits</h2>
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
                            description: "Protected by 3D Secure technology"
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

            <section className="bg-gray-50 py-12 mb-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Protected by Industry-Leading Security
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { name: "PCI DSS Compliant", logo: "/images/pci-dss.png" },
                            { name: "3D Secure", logo: "/images/3d-secure.png" },
                            { name: "SSL Encrypted", logo: "/images/ssl-badge.png" },
                            { name: "Mastercard SecureCode", logo: "/images/secure-code.png" }
                        ].map((badge, index) => (
                            <div 
                                key={index}
                                className="flex flex-col items-center"
                            >
                                <img 
                                    src={badge.logo} 
                                    alt={badge.name} 
                                    className="h-16 object-contain mb-4"
                                />
                                <span className="text-sm text-gray-600">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                                        ? 'bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 hover:from-red-700 hover:to-orange-700 dark:hover:from-red-600 dark:hover:to-orange-600'
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

export default MasterCard; 