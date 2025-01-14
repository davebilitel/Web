import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    ClockIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';

const TransactionSummary = ({ summary }) => {
    const [expandedStatus, setExpandedStatus] = useState(null);

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESSFUL':
                return 'bg-green-50 border-green-200';
            case 'FAILED':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-yellow-50 border-yellow-200';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {summary.map((statusGroup) => (
                <motion.div
                    key={statusGroup._id}
                    className={`rounded-lg border p-4 ${getStatusColor(statusGroup._id)}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedStatus(
                            expandedStatus === statusGroup._id ? null : statusGroup._id
                        )}
                    >
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(statusGroup._id)}
                            <h3 className="font-medium">{statusGroup._id}</h3>
                        </div>
                        <button>
                            {expandedStatus === statusGroup._id ? 
                                <ChevronUpIcon className="w-5 h-5" /> : 
                                <ChevronDownIcon className="w-5 h-5" />
                            }
                        </button>
                    </div>

                    <div className="mt-2">
                        <div className="text-sm">
                            <div className="flex justify-between">
                                <span>Total Transactions:</span>
                                <span className="font-medium">{statusGroup.totalCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Amount (USD):</span>
                                <span className="font-medium">${statusGroup.totalAmountUSD.toFixed(2)}</span>
                            </div>
                        </div>

                        {expandedStatus === statusGroup._id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4"
                            >
                                <h4 className="text-sm font-medium mb-2">By Country</h4>
                                <div className="space-y-2">
                                    {statusGroup.countries.sort((a, b) => 
                                        b.totalAmountUSD - a.totalAmountUSD
                                    ).map((country, idx) => (
                                        <div 
                                            key={country.country} 
                                            className="text-sm bg-white/50 rounded p-2"
                                        >
                                            <div className="flex justify-between">
                                                <span>{country.country}</span>
                                                <span>{country.count} txns</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600">
                                                <span>{country.totalAmount.toFixed(2)} {country.currency}</span>
                                                <span>${country.totalAmountUSD.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default TransactionSummary; 