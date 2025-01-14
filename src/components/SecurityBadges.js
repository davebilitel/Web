import React from 'react';
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const SecurityBadges = () => {
    return (
        <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
                <LockClosedIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Secure Payment</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* PCI Compliance Badge */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <ShieldCheckIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-xs font-medium text-center">PCI DSS Compliant</span>
                    <span className="text-xs text-gray-500 text-center">Level 1 Service Provider</span>
                </div>

                {/* SSL Badge */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <LockClosedIcon className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-xs font-medium text-center">SSL Encrypted</span>
                    <span className="text-xs text-gray-500 text-center">256-bit Protection</span>
                </div>

                {/* Fraud Protection */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <ShieldCheckIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-xs font-medium text-center">Fraud Protection</span>
                    <span className="text-xs text-gray-500 text-center">24/7 Monitoring</span>
                </div>

                {/* Payment Guarantee */}
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mb-2" />
                    <span className="text-xs font-medium text-center">Money-Back Guarantee</span>
                    <span className="text-xs text-gray-500 text-center">100% Secure Transactions</span>
                </div>
            </div>

            {/* Security Info */}
            <div className="mt-6 text-xs text-gray-500 text-center">
                <p>🔒 Your payment information is encrypted end-to-end</p>
                <p className="mt-1">We never store your card details on our servers</p>
            </div>
        </div>
    );
};

export default SecurityBadges; 