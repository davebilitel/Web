import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

function TransactionTimeline({ transactions }) {
    return (
        <motion.div 
            className="hidden lg:block w-full space-y-3
                backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 p-6 rounded-2xl
                border border-white/20 dark:border-gray-700 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Recent Transactions
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {transactions.map((tx, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                        data-tooltip-id={`tx-${index}`}
                        data-tooltip-content="Click for details"
                    >
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg
                            hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        {tx.merchant}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {tx.date}
                                    </p>
                                </div>
                                <p className={`text-sm font-medium ${
                                    tx.type === 'credit' 
                                        ? 'text-green-500 dark:text-green-400' 
                                        : 'text-red-500 dark:text-red-400'
                                }`}>
                                    {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                                </p>
                            </div>
                        </div>
                        <Tooltip id={`tx-${index}`} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

export default TransactionTimeline; 