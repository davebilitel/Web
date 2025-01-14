import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useTranslation } from 'react-i18next';

function MobileMenu({ isOpen, onClose, navItems, onTryDemo }) {
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useDarkMode();
    const { t } = useTranslation();
    
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    />

                    {/* Slide-out menu */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-8">
                                <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
                                    CardStore
                                </Link>
                                <button onClick={onClose} className="p-2">
                                    <span className="sr-only">{t('header.closeMenu')}</span>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6 px-2">
                                <button
                                    onClick={() => {
                                        onTryDemo();
                                        onClose();
                                    }}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 
                                        text-white rounded-lg font-medium shadow-md hover:shadow-lg 
                                        transition-shadow flex items-center justify-center space-x-2"
                                >
                                    <span>{t('header.tryDemo')}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <nav className="space-y-4">
                                {navItems.map((item) => (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link
                                            to={item.href}
                                            onClick={onClose}
                                            className={`block py-2 px-4 transition-colors ${
                                                location.pathname === item.href
                                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600'
                                                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                        >
                                            {item.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Dark Mode Toggle */}
                            <div className="px-4 py-3 border-t border-gray-200">
                                <button 
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="flex items-center space-x-2 w-full py-2 text-gray-600 hover:text-blue-600 dark:text-gray-300"
                                >
                                    {isDarkMode ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                                            />
                                        </svg>
                                    )}
                                    <span>{isDarkMode ? t('header.lightMode') : t('header.darkMode')}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default MobileMenu; 