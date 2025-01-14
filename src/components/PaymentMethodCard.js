import React from 'react';
import { motion } from 'framer-motion';
import { 
    CreditCardIcon, 
    DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

function PaymentMethodCard({ method, selected, onSelect, country }) {
    const getMethodDetails = (method, country) => {
        switch (method) {
            case 'CAMPAY':
                return {
                    title: 'Mobile Money',
                    description: 'Pay with MTN or Orange Money',
                    providers: [
                        { name: 'MTN', color: 'bg-yellow-400 text-yellow-800' },
                        { name: 'Orange', color: 'bg-orange-500 text-white' }
                    ],
                    bgGradient: 'from-yellow-50 to-orange-50'
                };
            case 'FLUTTERWAVE':
                const providers = {
                    'SN': [
                        { name: 'Orange Money', color: 'bg-orange-500 text-white' },
                        { name: 'Wave', color: 'bg-blue-500 text-white' }
                    ],
                    'RW': [{ name: 'Mobile Money', color: 'bg-purple-500 text-white' }],
                    'UG': [{ name: 'Mobile Money', color: 'bg-green-500 text-white' }],
                    'KE': [{ name: 'M-Pesa', color: 'bg-green-600 text-white' }]
                };
                return {
                    title: 'Mobile Payment',
                    description: getPaymentDescription(country),
                    providers: providers[country] || [],
                    bgGradient: 'from-blue-50 to-purple-50'
                };
            default:
                return {
                    title: 'Select Payment Method',
                    description: 'Choose your preferred payment method',
                    providers: [],
                    bgGradient: 'from-gray-50 to-gray-100'
                };
        }
    };

    const getPaymentDescription = (country) => {
        switch (country) {
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

    const methodDetails = getMethodDetails(method, country);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method)}
            className={`
                relative p-6 rounded-xl cursor-pointer transition-all duration-300
                ${selected ? 'ring-2 ring-blue-500 shadow-lg' : 'ring-1 ring-gray-200 hover:shadow-md'}
                bg-gradient-to-br ${methodDetails.bgGradient}
            `}
        >
            <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {methodDetails.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {methodDetails.description}
                        </p>
                    </div>
                    <div className="text-blue-500">
                        {method === 'CAMPAY' ? (
                            <DevicePhoneMobileIcon className="h-6 w-6" />
                        ) : (
                            <CreditCardIcon className="h-6 w-6" />
                        )}
                    </div>
                </div>

                {/* Provider Pills */}
                <div className="flex flex-wrap gap-2">
                    {methodDetails.providers.map((provider, index) => (
                        <div
                            key={index}
                            className={`
                                px-3 py-1.5 rounded-full
                                ${provider.color}
                                flex items-center space-x-2
                                text-sm font-medium
                            `}
                        >
                            <DevicePhoneMobileIcon className="h-4 w-4" />
                            <span>{provider.name}</span>
                        </div>
                    ))}
                </div>

                {/* Selected Indicator */}
                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default PaymentMethodCard; 