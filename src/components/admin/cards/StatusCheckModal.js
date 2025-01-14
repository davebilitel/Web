import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const StatusCheckModal = ({ isOpen, onClose, statusInfo }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESSFUL':
                return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            case 'FAILED':
                return <XCircleIcon className="w-6 h-6 text-red-500" />;
            default:
                return <ClockIcon className="w-6 h-6 text-yellow-500" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    static
                    as={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    open={isOpen}
                    onClose={onClose}
                    className="relative z-50"
                >
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel
                            as={motion.div}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Dialog.Title className="text-lg font-medium">
                                    Transaction Status Check
                                </Dialog.Title>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {statusInfo && (
                                <div className="space-y-4">
                                    {/* Transaction Details */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                                            Transaction Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Order ID</p>
                                                <p className="font-mono">{statusInfo.orderId}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Payment Method</p>
                                                <p>{statusInfo.paymentMethod}</p>
                                            </div>
                                            {statusInfo.reference && (
                                                <div>
                                                    <p className="text-gray-500">Reference</p>
                                                    <p className="font-mono">{statusInfo.reference}</p>
                                                </div>
                                            )}
                                            {statusInfo.transactionId && (
                                                <div>
                                                    <p className="text-gray-500">Transaction ID</p>
                                                    <p className="font-mono">{statusInfo.transactionId}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                                            Order Information
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <div className="flex items-center">
                                                    {getStatusIcon(statusInfo.order?.status)}
                                                    <span className="ml-2">{statusInfo.order?.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Amount</span>
                                                <span>{statusInfo.order?.amount} {statusInfo.order?.currency}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Created At</span>
                                                <span>{new Date(statusInfo.order?.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    {statusInfo.order?.payment_details && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                Payment Details
                                            </h3>
                                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                {JSON.stringify(statusInfo.order.payment_details, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default StatusCheckModal; 