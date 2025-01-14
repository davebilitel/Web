import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CreditCardIcon, LockClosedIcon, CogIcon } from '@heroicons/react/24/outline';

function CardDemoModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('customize');
    const [cardLimit, setCardLimit] = useState(1000);
    const [isCardFrozen, setIsCardFrozen] = useState(false);
    const [cardSettings, setCardSettings] = useState({
        onlinePayments: true,
        internationalPayments: false,
        notifications: true
    });

    const tabs = [
        { id: 'customize', label: 'Customize', icon: <CogIcon className="w-5 h-5" /> },
        { id: 'security', label: 'Security', icon: <LockClosedIcon className="w-5 h-5" /> },
        { id: 'transactions', label: 'Activity', icon: <CreditCardIcon className="w-5 h-5" /> }
    ];

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", duration: 0.5 }
        },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-2xl bg-white dark:bg-dark-bg-tertiary 
                            rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b 
                            border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-blue-400">
                                Interactive Card Demo
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 
                                    dark:hover:bg-gray-800 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-6 py-4 transition-colors
                                        ${activeTab === tab.id 
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {activeTab === 'customize' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Card Limit
                                        </label>
                                        <input
                                            type="range"
                                            min="100"
                                            max="5000"
                                            value={cardLimit}
                                            onChange={(e) => setCardLimit(e.target.value)}
                                            className="w-full"
                                        />
                                        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                                            ${cardLimit}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">Card Status</span>
                                        <button
                                            onClick={() => setIsCardFrozen(!isCardFrozen)}
                                            className={`px-4 py-2 rounded-lg transition-colors
                                                ${isCardFrozen 
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                                    : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                }`}
                                        >
                                            {isCardFrozen ? 'Frozen' : 'Active'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-4">
                                    {Object.entries(cardSettings).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </span>
                                            <button
                                                onClick={() => setCardSettings(prev => ({
                                                    ...prev,
                                                    [key]: !prev[key]
                                                }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full
                                                    ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full 
                                                        bg-white transition-transform
                                                        ${value ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'transactions' && (
                                <div className="space-y-4">
                                    {[
                                        { merchant: 'Netflix', amount: -13.99, date: 'Today' },
                                        { merchant: 'Amazon', amount: -49.99, date: 'Yesterday' },
                                        { merchant: 'Deposit', amount: 100.00, date: '3 days ago' }
                                    ].map((tx, index) => (
                                        <div key={index} className="flex items-center justify-between p-3
                                            bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {tx.merchant}
                                                </div>
                                                <div className="text-sm text-gray-500">{tx.date}</div>
                                            </div>
                                            <div className={`font-medium ${
                                                tx.amount > 0 ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'
                                            }`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default CardDemoModal; 