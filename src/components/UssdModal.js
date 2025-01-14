import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

function UssdModal({ isOpen, onClose, ussdCode, operator, reference }) {
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
                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                    {/* Modal container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel
                            as={motion.div}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            {/* Content */}
                            <div className="text-center">
                                <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                                    Complete Your Payment
                                </Dialog.Title>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Dial this USSD code:</p>
                                        <p className="text-xl font-mono font-bold text-gray-900">
                                            {ussdCode}
                                        </p>
                                    </div>

                                    <div className="text-left space-y-2">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Operator:</span> {operator}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Reference:</span>{' '}
                                            <span className="font-mono">{reference}</span>
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                        <p className="text-sm text-blue-700">
                                            Follow the prompts on your phone to complete the payment.
                                            Keep this window open until you complete the payment.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
}

export default UssdModal; 