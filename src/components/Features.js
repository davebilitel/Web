import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
    CreditCardIcon, 
    ShieldCheckIcon, 
    GlobeAltIcon, 
    BanknotesIcon,
    DevicePhoneMobileIcon,
    ClockIcon,
    LockClosedIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import CardDemo from './CardDemo';
import TransactionTimeline from './TransactionTimeline';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';
import { Tooltip } from 'react-tooltip';
import CardDemoModal from './CardDemoModal';

function Features() {
    const [theme, setTheme] = useState('blue');
    const [type, setType] = useState('virtual');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDemoModal, setShowDemoModal] = useState(false);
    
    const transactions = [
        { merchant: 'Netflix', amount: '13.99', date: 'Today', type: 'debit' },
        { merchant: 'Starlink', amount: '110.00', date: 'Today', type: 'debit' },
        { merchant: 'Meta Ads', amount: '250.00', date: 'Yesterday', type: 'debit' },
        { merchant: 'Amazon', amount: '49.99', date: 'Yesterday', type: 'debit' },
        { merchant: 'Refund', amount: '25.00', date: '2 days ago', type: 'credit' },
    ];

    const floatingIcons = [
        { 
            component: <LockClosedIcon className="w-6 h-6 text-blue-600" />,
            position: { top: '-20px', left: '-40px' },
            rotation: 15
        },
        { 
            component: <ShieldCheckIcon className="w-6 h-6 text-purple-600" />,
            position: { top: '40px', right: '-30px' },
            rotation: -15
        },
        // Add more icons as needed
    ];

    const mainFeatures = [
        {
            title: "Premium Virtual Cards",
            description: "Choose from a variety of verified virtual cards",
            icon: <CreditCardIcon className="w-8 h-8" />,
            color: "from-blue-400 to-blue-600"
        },
        {
            title: "Secure Platform",
            description: "Encrypted transactions and secure card delivery",
            icon: <ShieldCheckIcon className="w-8 h-8" />,
            color: "from-purple-400 to-purple-600"
        },
        {
            title: "Global Shopping",
            description: "Shop at millions of online stores worldwide",
            icon: <GlobeAltIcon className="w-8 h-8" />,
            color: "from-green-400 to-green-600"
        },
        {
            title: "Instant Delivery",
            description: "Receive your card details immediately after purchase",
            icon: <BanknotesIcon className="w-8 h-8" />,
            color: "from-pink-400 to-pink-600"
        }
    ];

    const additionalFeatures = [
        {
            title: "Multiple Options",
            description: "Various denominations and validity periods available",
            icon: <DevicePhoneMobileIcon className="w-6 h-6" />
        },
        {
            title: "Expert Support",
            description: "Dedicated assistance for your purchase and usage needs",
            icon: <ClockIcon className="w-6 h-6" />
        },
        
    ];

    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { 
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const handleTryDemo = () => {
        setShowDemoModal(true);
    };

    const cardDemoSection = (
        <div className="relative flex justify-center items-center">
            {/* Main Container with proper spacing */}
            <div className="relative w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-8 px-4 lg:px-12">
                {/* Left Side: Interactive Feature Demo */}
                <div className="lg:w-[30%] w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/80 dark:bg-gray-800/90 p-8 rounded-xl 
                            shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700 h-full"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                            Premium Virtual Card Features

                        </h3>
                        
                        {/* Feature List */}
                        <div className="space-y-6">
                            {[
                                "Get unlimited virtual cards",
                                "Choose from various denominations",
                                "Multiple payment options",
                                "Secure online payments",
                                "Transparent fee structure",
                                "Safe payment processing",
                                "24/7 customer support"
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-4"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                                        flex items-center justify-center shadow-md"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" 
                                                strokeWidth={2} d="M5 13l4 4L19 7" 
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-base text-gray-700 dark:text-gray-300">
                                        {item}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Center: Card Demo */}
                <div className="lg:w-[35%] w-full relative mx-auto">
                    <AnimatePresence>
                        {isLoading && <LoadingState />}
                        {error && <ErrorMessage message={error} onRetry={handleTryDemo} />}
                    </AnimatePresence>

                    {/* Floating Icons */}
                    {floatingIcons.map((icon, index) => (
                        <motion.div
                            key={index}
                            className="absolute"
                            style={{ ...icon.position }}
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, icon.rotation, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: index * 0.2
                            }}
                        >
                            <div className="w-12 h-12 rounded-full bg-white/90 
                                dark:bg-dark-bg-tertiary/90 shadow-lg flex 
                                items-center justify-center"
                            >
                                {icon.component}
                            </div>
                        </motion.div>
                    ))}

                    <CardDemo theme={theme} type={type} />
                </div>

                {/* Right Side: Transaction Timeline */}
                <div className="lg:w-[30%] w-full">
                    <TransactionTimeline transactions={transactions} />
                </div>
            </div>

            {/* Tooltips */}
            <Tooltip id="theme-tooltip" />
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg-primary dark:to-dark-bg-secondary">
                {/* Hero Section with Floating Elements */}
                <section className="relative overflow-hidden pt-32 pb-40">
                    {/* Background Decorations */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto px-4 relative">
                        {/* Hero Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center max-w-4xl mx-auto mb-24"
                        >
                            <motion.h1 
                                className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent 
                                    bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 
                                    dark:to-purple-400 mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Virtual Cards Made Simple
                            </motion.h1>
                            <motion.p 
                                className="text-xl text-gray-600 dark:text-blue-300 max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Get instant access to premium virtual cards for all your digital payments
                            </motion.p>
                        </motion.div>

                        {/* Interactive Card Demo Section */}
                        <div className="relative mb-16 lg:mb-40">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                                rounded-3xl blur-2xl transform -rotate-1" />
                            {cardDemoSection}
                        </div>

                        {/* Features Grid with Hover Effects */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-32">
                            {[...mainFeatures, ...additionalFeatures].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                                        rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" 
                                    />
                                    <div className="relative bg-white/80 dark:bg-dark-bg-tertiary/80 backdrop-blur-sm 
                                        p-8 rounded-2xl shadow-lg border border-white/20 dark:border-white/10 
                                        group-hover:shadow-2xl transition-all duration-300"
                                    >
                                        <div className="mb-6">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 
                                                to-purple-600 flex items-center justify-center transform 
                                                group-hover:rotate-6 transition-transform duration-300"
                                            >
                                                <div className="text-white">
                                                    {feature.icon}
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-blue-400 mb-4 
                                            group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors"
                                        >
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-blue-300 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <CardDemoModal 
                isOpen={showDemoModal} 
                onClose={() => setShowDemoModal(false)} 
            />
        </>
    );
}

export default Features; 