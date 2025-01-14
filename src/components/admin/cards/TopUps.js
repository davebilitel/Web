import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    CreditCardIcon, 
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    GlobeAltIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import StatusCheckModal from './StatusCheckModal';
import TransactionSummary from './TransactionSummary';
import TransactionControls from './TransactionControls';

const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Email Sent Successfully!</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        The confirmation email has been sent to the customer.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-5 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SecretTransactions = ({ transactions, onSendEmail }) => {
    return (
        <div className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                Successful Top-ups
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions.map((tx) => (
                    <motion.div 
                        key={tx._id} 
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        layout // This will animate the grid reorganization
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{tx.customerEmail}</p>
                                <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">${tx.amount}</p>
                                <p className="text-xs text-gray-500">{tx.currency}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">Card: {tx.cardNumber}</p>
                            <button
                                onClick={() => onSendEmail(tx)}
                                className="flex items-center px-3 py-1.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            >
                                <EnvelopeIcon className="w-4 h-4 mr-1" />
                                Send Confirmation
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
            {transactions.length === 0 && (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 py-4"
                >
                    No successful transactions yet
                </motion.p>
            )}
        </div>
    );
};

const TopUps = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusModal, setStatusModal] = useState({ isOpen: false, data: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt:desc');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [successfulTransactions, setSuccessfulTransactions] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.get('/api/admin/top-up-transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setTransactions(response.data.transactions);
            setSummary(response.data.summary);
            
            const successful = response.data.transactions
                .filter(tx => tx.status === 'SUCCESSFUL' && !tx.emailConfirmed);
            setSuccessfulTransactions(successful);
            
            setError(null);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err.response?.data?.error || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'SUCCESSFUL':
                return (
                    <span className="flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Successful
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="flex items-center px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Failed
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Pending
                    </span>
                );
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStatusChange = async (transactionId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const newStatus = currentStatus === 'SUCCESSFUL' ? 'FAILED' : 'SUCCESSFUL';
            
            await axios.patch(
                `/api/admin/top-up-transactions/${transactionId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            // Refresh transactions after status update
            fetchTransactions();
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update transaction status');
        }
    };

    const handleCheckStatus = async (reference, paymentMethod, transaction) => {
        try {
            const token = localStorage.getItem('adminToken');
            const payload = {
                reference,
                paymentMethod,
                orderId: transaction._id,
                transactionId: transaction.transaction_id || transaction.payment_details?.transaction_id
            };

            console.log('Checking status with payload:', payload);

            const response = await axios.post(
                '/api/verify-top-up-payment',
                payload,
                { headers: { Authorization: `Bearer ${token}` }}
            );

            // Open modal with status information
            setStatusModal({
                isOpen: true,
                data: {
                    ...payload,
                    order: response.data.order || transaction,
                    verificationResponse: response.data
                }
            });

            if (response.data.status === 'success') {
                fetchTransactions();
            }
        } catch (error) {
            console.error('Error checking status:', error);
            setError('Failed to check transaction status');
        }
    };

    const handleSendEmail = async (transaction) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(
                '/api/admin/send-topup-confirmation',
                { transactionId: transaction._id },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            // Remove the transaction from successfulTransactions
            setSuccessfulTransactions(prev => 
                prev.filter(tx => tx._id !== transaction._id)
            );
            
            // Show success modal instead of alert
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            alert('Failed to send confirmation email');
        }
    };

    // Filter and sort transactions
    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(tx => 
                tx.cardNumber.toLowerCase().includes(searchLower) ||
                tx.customerName.toLowerCase().includes(searchLower) ||
                tx.country.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        const [sortField, sortDirection] = sortBy.split(':');
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'createdAt':
                    comparison = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'amount':
                    comparison = a.amountUSD - b.amountUSD;
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'country':
                    comparison = a.country.localeCompare(b.country);
                    break;
                default:
                    comparison = 0;
            }
            return sortDirection === 'desc' ? -comparison : comparison;
        });

        return filtered;
    }, [transactions, searchTerm, sortBy]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedTransactions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredAndSortedTransactions, currentPage]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 py-8">
                <p>{error}</p>
                <button 
                    onClick={fetchTransactions}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Top-up Transactions</h2>
                <button
                    onClick={fetchTransactions}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    <ArrowPathIcon className="w-5 h-5 mr-2" />
                    Refresh
                </button>
            </div>

            <SecretTransactions 
                transactions={successfulTransactions}
                onSendEmail={handleSendEmail}
            />

            <TransactionSummary summary={summary} />

            <TransactionControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalTransactions={filteredAndSortedTransactions.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Card Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedTransactions.map((transaction) => (
                                <motion.tr
                                    key={transaction._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <CreditCardIcon className="h-8 w-8 text-gray-400" />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.cardNumber}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {transaction.customerName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${transaction.amount}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {transaction.currency}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-900">
                                                {transaction.country}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {transaction.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusChange(transaction._id, transaction.status)}
                                            className="cursor-pointer"
                                        >
                                            {getStatusBadge(transaction.status)}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(transaction.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleCheckStatus(transaction.reference, transaction.paymentMethod, transaction)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Check Status
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No transactions found
                    </div>
                )}
            </div>

            <StatusCheckModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ isOpen: false, data: null })}
                statusInfo={statusModal.data}
            />

            <SuccessModal 
                isOpen={showSuccessModal} 
                onClose={() => setShowSuccessModal(false)} 
            />
        </div>
    );
};

export default TopUps; 