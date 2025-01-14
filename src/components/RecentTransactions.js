import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { CreditCardIcon, PhoneIcon } from '@heroicons/react/24/outline';

const RecentTransactions = ({ transactions }) => {
    const getPaymentIcon = (method) => {
        switch (method) {
            case 'FLUTTERWAVE':
                return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
            case 'CAMPAY':
                return <PhoneIcon className="h-5 w-5 text-green-500" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Top-ups
            </h3>
            <div className="space-y-3">
                {transactions.map((transaction, index) => (
                    <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {getPaymentIcon(transaction.paymentMethod)}
                                <div>
                                    <p className="font-medium text-gray-900">
                                        ${transaction.amount} {transaction.currency}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(transaction.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {transaction.paymentMethod}
                                </span>
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                    </motion.div>
                ))}
                {transactions.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No recent transactions
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentTransactions; 