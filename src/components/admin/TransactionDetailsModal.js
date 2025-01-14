import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TransactionDetailsModal({ isOpen, onClose, transaction }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Transaction Details</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Transaction ID</p>
                                    <p className="font-medium">{transaction?.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="font-medium">{transaction?.amount} XAF</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        transaction?.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                        transaction?.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {transaction?.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-medium">{new Date(transaction?.date).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold mb-2">Customer Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{transaction?.customer?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{transaction?.customer?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default TransactionDetailsModal; 