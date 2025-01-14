import React from 'react';
import { formatCurrency } from '../utils/currency';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

function FloatingSummary({ amount, fee, paymentMethod, cardDetails, localAmount }) {
    const subtotal = parseFloat(amount) || 0;
    const feeAmount = parseFloat(fee) || 0;
    const total = subtotal + feeAmount;

    const getPaymentMethodText = (country) => {
        switch (country) {
            case 'CM':
                return 'Pay with MTN or Orange Money';
            case 'SN':
            case 'CI':
            case 'BF':
                return 'Pay with Orange Money or Wave';
            case 'RW':
            case 'UG':
                return 'Pay with Mobile Money';
            case 'KE':
                return 'Pay with M-Pesa';
            default:
                return 'Select payment method';
        }
    };

    const faqItems = [
        {
            question: "How long does it take to activate my card?",
            answer: "Your virtual card will be activated instantly after successful payment."
        },
        {
            question: "Is the processing fee refundable?",
            answer: "No, the processing fee is non-refundable and covers transaction costs."
        },
        {
            question: "Can I use my card immediately?",
            answer: "Yes, once payment is confirmed, you can start using your card right away."
        }
    ];

    return (
        <div className="space-y-6">
            {/* Main Summary Card - Enhanced hover and transition effects */}
            <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl ring-1 ring-gray-200/50 hover:ring-blue-200">
                {/* Gradient background with enhanced colors */}
                <div className="p-8 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 transition-colors">
                        Order Summary
                    </h3>

                    {/* Card Details - Enhanced with gradient and hover effects */}
                    <div className="mb-8 p-6 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50 transition-all duration-200 hover:border-blue-200 hover:shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">Card Type</span>
                            <span className="text-lg font-semibold text-blue-900">{cardDetails.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100/80 text-blue-700 transition-colors hover:bg-blue-100">
                                New Card
                            </span>
                        </div>
                    </div>

                    {/* Cost Breakdown - Enhanced transitions */}
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">Card Balance</span>
                            <span className="text-lg font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">Processing Fee</span>
                            <span className="text-lg font-semibold text-gray-900">${feeAmount.toFixed(2)}</span>
                        </div>

                        {localAmount?.amount > 0 && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 font-medium">Local Amount</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(localAmount.amount, localAmount.currencyCode)}
                                </span>
                            </div>
                        )}

                        {/* Total Amount - Enhanced with glow effect */}
                        <div className="border-t-2 border-gray-200 pt-4 mt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-900">Total</span>
                                <div className="text-right transition-all duration-300 hover:scale-105">
                                    <div className="text-2xl font-bold text-blue-600 drop-shadow-sm">
                                        ${total.toFixed(2)}
                                    </div>
                                    {localAmount?.amount > 0 && (
                                        <div className="text-base font-medium text-gray-600 mt-1">
                                            {formatCurrency(localAmount.amount, localAmount.currencyCode)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method - Enhanced gradient */}
                    {paymentMethod && (
                        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 -mx-8 -mb-8 p-6 border-t border-gray-200 transition-colors duration-200 hover:bg-gray-50">
                            <div className="flex flex-col space-y-2">
                                <span className="text-sm font-medium text-gray-500">Payment Method</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {paymentMethod === 'CAMPAY' 
                                        ? 'Pay with MTN or Orange Money' 
                                        : getPaymentMethodText(localAmount?.country)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FAQ Section - Enhanced hover effects */}
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg ring-1 ring-gray-200/50 hover:ring-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Frequently Asked Questions
                </h4>
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <div 
                            key={index}
                            className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                        >
                            <h5 className="text-sm font-medium text-gray-900 mb-1">
                                {item.question}
                            </h5>
                            <p className="text-sm text-gray-600">
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Note - Enhanced with subtle animation */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100 transition-all duration-200 hover:border-green-200 hover:shadow-sm">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg 
                            className="h-5 w-5 text-green-600 transition-transform duration-300 hover:scale-110" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-green-700">
                            Your payment is secured with end-to-end encryption
                        </p>
                    </div>
                </div>
            </div>

            {/* Support Contact - Enhanced hover effect */}
            <div className="text-center text-sm text-gray-500 transition-opacity duration-200 hover:opacity-90">
                Need help? <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">Contact Support</a>
            </div>
        </div>
    );
}

export default FloatingSummary; 