import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function HeroSection() {
    const { t } = useTranslation();
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 150]);
    
    // Add floating animation for cards
    const floatingAnimation = {
        initial: { y: 0 },
        animate: {
            y: [-10, 10, -10],
            rotate: [-8, -7, -8],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const floatingAnimationMaster = {
        initial: { y: 0 },
        animate: {
            y: [10, -10, 10],
            rotate: [8, 7, 8],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 
            dark:from-dark-bg-primary dark:to-dark-bg-secondary min-h-[75vh] md:min-h-[85vh] flex items-center">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-12 md:py-32 relative">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                    {/* Content */}
                    <div className="text-left w-full">
                        <motion.h1 
                            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="block mb-1 md:mb-2 bg-clip-text text-transparent 
                                bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 
                                dark:to-purple-400">
                                {t('home.hero.title')}
                            </span>
                            <span className="block text-gray-900 dark:text-gray-100">
                                {t('home.hero.subtitle')}
                            </span>
                        </motion.h1>

                        <motion.p 
                            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-10 max-w-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {t('home.hero.description')}
                        </motion.p>

                        <div className="flex flex-row gap-2 sm:gap-3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex-1 sm:flex-none"
                            >
                                <Link
                                    to="/visa"
                                    className="w-full inline-flex items-center justify-center px-3 sm:px-6 py-2.5 sm:py-3 
                                        text-sm sm:text-base rounded-lg bg-gradient-to-r from-blue-600 
                                        to-blue-700 text-white shadow-md transition duration-300 
                                        ease-out hover:scale-105 sm:min-w-[160px]"
                                >
                                    <span className="relative flex items-center justify-center font-semibold">
                                        <img 
                                            src="/images/visa-white.png" 
                                            alt="Visa" 
                                            className="h-3.5 sm:h-5 mr-1.5 sm:mr-2" 
                                        />
                                        <span className="whitespace-nowrap">Get Visa</span>
                                    </span>
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex-1 sm:flex-none"
                            >
                                <Link
                                    to="/mastercard"
                                    className="w-full inline-flex items-center justify-center px-3 sm:px-6 py-2.5 sm:py-3 
                                        text-sm sm:text-base rounded-lg bg-gradient-to-r from-red-600 
                                        to-orange-600 text-white shadow-md transition duration-300 
                                        ease-out hover:scale-105 sm:min-w-[160px]"
                                >
                                    <span className="relative flex items-center justify-center font-semibold">
                                        <img 
                                            src="/images/mastercard-white.png" 
                                            alt="Mastercard" 
                                            className="h-3.5 sm:h-5 mr-1.5 sm:mr-2" 
                                        />
                                        <span className="whitespace-nowrap">Get Mastercard</span>
                                    </span>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Trust Badges */}
                        <motion.div 
                            className="mt-8 md:mt-12 flex gap-4 md:gap-6 items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <img 
                                src="/images/visa-white.png" 
                                alt="Visa" 
                                className="h-6 md:h-8 object-contain opacity-70 hover:opacity-100 transition-opacity" 
                            />
                            <img 
                                src="/images/mastercard-white.png" 
                                alt="Mastercard" 
                                className="h-6 md:h-8 object-contain opacity-70 hover:opacity-100 transition-opacity" 
                            />
                        </motion.div>
                    </div>

                    {/* 3D Card Visual */}
                    <motion.div 
                        className="relative w-full h-[150px] md:h-[400px] mt-8 md:mt-0 perspective-1000"
                        style={{ y }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative h-full">
                            {/* Background glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl opacity-30 blur-2xl transform rotate-6 scale-105" />
                            
                            {/* Floating cards */}
                            <motion.div className="absolute top-0 left-0 w-full h-full">
                                {/* Visa Card */}
                                <motion.div
                                    {...floatingAnimation}
                                    className="absolute top-0 right-[5%] w-[45%] md:w-[70%]"
                                    whileHover={{ scale: 1.05, zIndex: 2, rotate: -5 }}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl transform rotate-6 scale-95 opacity-50 blur-lg" />
                                        <div className="relative w-full aspect-[1.6/1] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-3 sm:p-6">
                                            {/* Bank Name */}
                                            <div className="absolute top-2 sm:top-6 right-2 sm:right-6 text-white/80 text-[8px] sm:text-sm font-medium">
                                                VIRTUAL BANK
                                            </div>

                                            {/* Card Chip */}
                                            <div className="absolute top-2 sm:top-6 left-2 sm:left-6">
                                                <div className="w-6 h-5 sm:w-12 sm:h-10 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-400 chip-animation grid grid-cols-2 grid-rows-3 gap-[1px] p-[1px] sm:p-[2px]">
                                                    {[...Array(6)].map((_, i) => (
                                                        <div key={i} className="bg-yellow-600/50" />
                                                    ))}
                                                </div>
                                                {/* Contactless Symbol */}
                                                <div className="mt-1 sm:mt-2 ml-0.5 sm:ml-1">
                                                    <svg className="w-3 h-3 sm:w-6 sm:h-6 text-white/70" viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 4C14.2091 4 16 5.79086 16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        <path d="M12 8C13.1046 8 14 8.89543 14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        <path d="M12 0C16.4183 0 20 3.58172 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Card Number */}
                                            <div className="absolute bottom-8 sm:bottom-16 left-2 sm:left-6 right-2 sm:right-6">
                                                <div className="text-white font-mono text-[10px] sm:text-xl tracking-widest">
                                                    <span className="mr-2 sm:mr-4">4000</span>
                                                    <span className="mr-2 sm:mr-4">1234</span>
                                                    <span className="mr-2 sm:mr-4">5678</span>
                                                    <span>9010</span>
                                                </div>
                                                {/* Card Details */}
                                                <div className="mt-2 sm:mt-4 flex justify-between text-white/80 text-[8px] sm:text-sm">
                                                    <div>
                                                        <div className="text-[6px] sm:text-xs uppercase opacity-75">Valid Thru</div>
                                                        <div>12/25</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[6px] sm:text-xs uppercase opacity-75">CVV</div>
                                                        <div>***</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Visa Logo */}
                                            <div className="absolute bottom-2 sm:bottom-6 right-2 sm:right-6">
                                                <div className="text-white font-bold text-sm sm:text-2xl italic tracking-wider">
                                                    VISA
                                                </div>
                                            </div>

                                            {/* Card Shine Effect */}
                                            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Mastercard */}
                                <motion.div
                                    {...floatingAnimationMaster}
                                    className="absolute top-[15%] left-[5%] w-[45%] md:w-[70%]"
                                    whileHover={{ scale: 1.05, zIndex: 2, rotate: 5 }}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl transform rotate-6 scale-95 opacity-50 blur-lg" />
                                        <div className="relative w-full aspect-[1.6/1] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6">
                                            {/* Bank Name */}
                                            <div className="absolute top-2 sm:top-6 right-2 sm:right-6 text-white/80 text-[8px] sm:text-sm font-medium">
                                                VIRTUAL BANK
                                            </div>

                                            {/* Card Chip */}
                                            <div className="absolute top-2 sm:top-6 left-2 sm:left-6">
                                                <div className="w-6 h-5 sm:w-12 sm:h-10 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-400 chip-animation grid grid-cols-2 grid-rows-3 gap-[1px] p-[1px] sm:p-[2px]">
                                                    {[...Array(6)].map((_, i) => (
                                                        <div key={i} className="bg-yellow-600/50" />
                                                    ))}
                                                </div>
                                                {/* Contactless Symbol */}
                                                <div className="mt-1 sm:mt-2 ml-0.5 sm:ml-1">
                                                    <svg className="w-3 h-3 sm:w-6 sm:h-6 text-white/70" viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 4C14.2091 4 16 5.79086 16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        <path d="M12 8C13.1046 8 14 8.89543 14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        <path d="M12 0C16.4183 0 20 3.58172 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Card Number */}
                                            <div className="absolute bottom-8 sm:bottom-16 left-2 sm:left-6 right-2 sm:right-6">
                                                <div className="text-white font-mono text-[10px] sm:text-xl tracking-widest">
                                                    <span className="mr-2 sm:mr-4">5200</span>
                                                    <span className="mr-2 sm:mr-4">8321</span>
                                                    <span className="mr-2 sm:mr-4">4567</span>
                                                    <span>8901</span>
                                                </div>
                                                {/* Card Details */}
                                                <div className="mt-2 sm:mt-4 flex justify-between text-white/80 text-[8px] sm:text-sm">
                                                    <div>
                                                        <div className="text-[6px] sm:text-xs uppercase opacity-75">Valid Thru</div>
                                                        <div>12/25</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[6px] sm:text-xs uppercase opacity-75">CVV</div>
                                                        <div>***</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mastercard Circles */}
                                            <div className="absolute bottom-2 sm:bottom-6 right-2 sm:right-6 flex items-center">
                                                <div className="w-4 h-4 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 opacity-90" />
                                                <div className="w-4 h-4 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 opacity-90 -ml-2 sm:-ml-4" />
                                                <div className="ml-1 sm:ml-2 text-white text-[8px] sm:text-sm font-medium">mastercard</div>
                                            </div>

                                            {/* Card Shine Effect */}
                                            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Decorative elements */}
                                <motion.div
                                    className="absolute top-[30%] right-[15%] w-12 h-12 md:w-16 md:h-16 bg-blue-400 rounded-full opacity-20 blur-xl"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.2, 0.3, 0.2],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <motion.div
                                    className="absolute bottom-[20%] left-[10%] w-12 h-12 md:w-20 md:h-20 bg-indigo-500 rounded-full opacity-20 blur-xl"
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.2, 0.4, 0.2],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection; 