import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import StatusSwitch from '../StatusSwitch';
import { formatCurrency } from '../../../utils/currency';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Toast from '../components/Toast';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    ChartTooltip,
    Legend
);

const isCardSent = (transaction) => {
    // Card is considered sent if:
    // 1. It's a card purchase transaction
    // 2. The payment was successful
    // 3. The status is SUCCESSFUL
    return (
        transaction.cardType && 
        transaction.status === 'SUCCESSFUL'
    );
};

function Overview({ 
    transactions, 
    monthlyStats,
    loading, 
    currentPage, 
    setCurrentPage,
    transactionsPerPage,
    selectedTransactions,
    setSelectedTransactions,
    onStatusChange,
    onRefresh,
    onCheckStatus,
    onDeleteSelected
}) {
    // Calculate stats with currency grouping
    const stats = {
        successful: {
            count: transactions.filter(t => t.status === 'SUCCESSFUL').length,
            transactions: transactions.filter(t => t.status === 'SUCCESSFUL')
        },
        failed: {
            count: transactions.filter(t => t.status === 'FAILED').length,
            transactions: transactions.filter(t => t.status === 'FAILED')
        },
        pending: {
            count: transactions.filter(t => t.status === 'PENDING').length,
            transactions: transactions.filter(t => t.status === 'PENDING')
        }
    };

    // Pagination
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

    // Chart data
    const getChartData = () => {
        const currencyDatasets = {};
        
        monthlyStats.forEach(stat => {
            // Process successful transactions
            stat.successful.transactions?.forEach(t => {
                const currency = t.currency || 'XAF';
                if (!currencyDatasets[currency]) {
                    currencyDatasets[currency] = {
                        successful: Array(monthlyStats.length).fill(0),
                        failed: Array(monthlyStats.length).fill(0)
                    };
                }
            });
            
            // Process failed transactions
            stat.failed.transactions?.forEach(t => {
                const currency = t.currency || 'XAF';
                if (!currencyDatasets[currency]) {
                    currencyDatasets[currency] = {
                        successful: Array(monthlyStats.length).fill(0),
                        failed: Array(monthlyStats.length).fill(0)
                    };
                }
            });
        });

        const datasets = [];
        Object.entries(currencyDatasets).forEach(([currency, data], index) => {
            // Add successful transactions dataset
            datasets.push({
                label: `Successful (${currency})`,
                data: monthlyStats.map(stat => {
                    return stat.successful.transactions
                        ?.filter(t => (t.currency || 'XAF') === currency)
                        ?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
                }),
                borderColor: `hsl(${120 + index * 40}, 70%, 45%)`,
                backgroundColor: `hsla(${120 + index * 40}, 70%, 45%, 0.5)`,
                fill: true
            });

            // Add failed transactions dataset
            datasets.push({
                label: `Failed (${currency})`,
                data: monthlyStats.map(stat => {
                    return stat.failed.transactions
                        ?.filter(t => (t.currency || 'XAF') === currency)
                        ?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
                }),
                borderColor: `hsl(${0 + index * 40}, 70%, 45%)`,
                backgroundColor: `hsla(${0 + index * 40}, 70%, 45%, 0.5)`,
                fill: true
            });
        });

        return {
            labels: monthlyStats.map(stat => stat.month),
            datasets
        };
    };

    const chartData = getChartData();

    // Add state for loading
    const [resendingReceipt, setResendingReceipt] = useState(null);

    // Add toast state
    const [toast, setToast] = useState({
        message: '',
        type: 'success',
        isVisible: false
    });

    const handleResendReceipt = async (transaction) => {
        try {
            setResendingReceipt(transaction._id);
            
            // Format and validate data before sending
            const formattedData = {
                email: transaction.customerEmail || '',
                name: transaction.customerName || '',
                orderDetails: {
                    cardType: transaction.cardType || 'N/A',
                    amount: parseFloat(transaction.amount) || 0,
                    amountUSD: transaction.amountUSD || parseFloat(transaction.amount / 650) || 0,
                    currency: transaction.currency || 'XAF',
                    reference: transaction.reference || transaction._id,
                    paymentMethod: transaction.paymentMethod || 'N/A',
                    transactionId: transaction.paymentMethod === 'CAMPAY' 
                        ? (transaction.operator_reference || transaction.code || 'N/A')
                        : (transaction.transaction_id || transaction.flw_ref || 'N/A'),
                    paymentDate: transaction.createdAt || new Date().toISOString(),
                    phone: transaction.customerPhone || 'N/A',
                    country: transaction.country || 'CM'
                }
            };

            // Validate required fields
            if (!formattedData.email || !formattedData.name) {
                setToast({
                    message: 'Missing required customer information',
                    type: 'error',
                    isVisible: true
                });
                return;
            }

            const response = await axios.post('/api/email/resend-receipt', formattedData);

            if (response.data.success) {
                setToast({
                    message: 'Receipt resent successfully',
                    type: 'success',
                    isVisible: true
                });
            } else {
                throw new Error(response.data.error || 'Failed to resend receipt');
            }
        } catch (error) {
            console.error('Failed to resend receipt:', error);
            setToast({
                message: 'Failed to resend receipt: ' + (error.response?.data?.error || error.message),
                type: 'error',
                isVisible: true
            });
        } finally {
            setResendingReceipt(null);
        }
    };

    // Add these state variables at the top of the Overview component
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc' // or 'asc'
    });

    // Add search state at the top of the Overview component
    const [searchTerm, setSearchTerm] = useState('');

    // Update the sorting function to include new fields
    const sortTransactions = (transactions) => {
        const sortedTransactions = [...transactions].sort((a, b) => {
            switch (sortConfig.key) {
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'amount':
                    return (b.amount || 0) - (a.amount || 0);
                case 'customerName':
                    return (a.customerName || '').localeCompare(b.customerName || '');
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'paymentMethod':
                    return (a.paymentMethod || '').localeCompare(b.paymentMethod || '');
                case 'country':
                    return (a.country || '').localeCompare(b.country || '');
                case 'cardSent':
                    return (isCardSent(b) ? 1 : 0) - (isCardSent(a) ? 1 : 0);
                case 'cardType':
                    return (a.cardType || '').localeCompare(b.cardType || '');
                default:
                    return 0;
            }
        });

        return sortConfig.direction === 'desc' ? sortedTransactions : sortedTransactions.reverse();
    };

    // Add search function
    const filterTransactions = (transactions) => {
        if (!searchTerm) return transactions;

        return transactions.filter(transaction => {
            const searchFields = [
                transaction.customerName,
                transaction.customerEmail,
                transaction.customerPhone,
                transaction.reference,
                transaction.cardType,
                transaction.paymentMethod,
                transaction.status,
                getCountryName(transaction.country),
                transaction.amount?.toString(),
                transaction.currency
            ].map(field => field?.toLowerCase() || '');

            const searchTerms = searchTerm.toLowerCase().split(' ');
            return searchTerms.every(term => 
                searchFields.some(field => field.includes(term))
            );
        });
    };

    // Update the transactions processing
    const filteredTransactions = filterTransactions(transactions);
    const sortedTransactions = sortTransactions(filteredTransactions);
    const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);

    // Add sort handler
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Create a SortableHeader component
    const SortableHeader = ({ label, sortKey }) => {
        const isActive = sortConfig.key === sortKey;
        return (
            <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(sortKey)}
            >
                <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <span className="inline-block w-4">
                        {isActive && (
                            sortConfig.direction === 'asc' 
                                ? '↑'
                                : '↓'
                        )}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
        >
            {/* Add Toast component */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsCard title="Successful" stats={stats.successful} color="green" />
                <StatsCard title="Failed" stats={stats.failed} color="red" />
                <StatsCard title="Pending" stats={stats.pending} color="yellow" />
            </div>

            {/* Search and Filters Section */}
            <div className="bg-white rounded-lg shadow-lg mb-6 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-lg">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-gray-600">
                        Showing {sortedTransactions.length} of {transactions.length} transactions
                        {searchTerm && ` (filtered from ${transactions.length})`}
                    </div>
                </div>
            </div>

            {/* Updated Transactions Table */}
            <div className="bg-white rounded-lg shadow-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold">Recent Transactions</h2>
                        {sortConfig.key !== 'createdAt' && (
                            <span className="text-sm text-gray-500">
                                Sorted by {sortConfig.key} ({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
                            </span>
                        )}
                    </div>
                    {selectedTransactions.length > 0 && (
                        <button
                            onClick={onDeleteSelected}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Delete Selected ({selectedTransactions.length})
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedTransactions(sortedTransactions.map(t => t._id));
                                            } else {
                                                setSelectedTransactions([]);
                                            }
                                        }}
                                    />
                                </th>
                                <SortableHeader label="Date" sortKey="createdAt" />
                                <SortableHeader label="Type" sortKey="cardType" />
                                <SortableHeader label="Customer" sortKey="customerName" />
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <SortableHeader label="Amount" sortKey="amount" />
                                <SortableHeader label="Payment Method" sortKey="paymentMethod" />
                                <SortableHeader label="Status" sortKey="status" />
                                <SortableHeader label="Country" sortKey="country" />
                                <SortableHeader label="Card Sent" sortKey="cardSent" />
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentTransactions.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedTransactions.includes(transaction._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedTransactions([...selectedTransactions, transaction._id]);
                                                } else {
                                                    setSelectedTransactions(
                                                        selectedTransactions.filter(id => id !== transaction._id)
                                                    );
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(transaction.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            transaction.cardType ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {transaction.cardType ? 'Card Purchase' : 'Top Up'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                                        <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {transaction.customerPhone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {transaction.cardType || transaction.cardNumber || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(transaction.amount, transaction.currency)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {transaction.paymentMethod}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusSwitch
                                            status={transaction.status}
                                            onUpdate={(newStatus) => onStatusChange(transaction._id, transaction.status)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getCountryName(transaction.country)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {transaction.cardType && (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                isCardSent(transaction)
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {isCardSent(transaction) ? 'Sent' : 'Not Sent'}
                                            </span>
                                        )}
                                        {!transaction.cardType && (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleResendReceipt(transaction)}
                                            disabled={resendingReceipt === transaction._id}
                                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md 
                                                ${resendingReceipt === transaction._id 
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                    : 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200'} 
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                        >
                                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                                            {resendingReceipt === transaction._id ? 'Sending...' : 'Resend Receipt'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onCheckStatus(transaction.reference)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Check Status
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} entries
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
                <Line data={chartData} options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Last 6 Transactions'
                        }
                    }
                }} />
            </div>

            {/* Add Empty State */}
            {sortedTransactions.length === 0 && (
                <tr>
                    <td colSpan="13" className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? (
                            <>
                                <p className="text-lg font-semibold">No matching transactions found</p>
                                <p className="text-sm mt-2">Try adjusting your search terms</p>
                            </>
                        ) : (
                            <p className="text-lg font-semibold">No transactions available</p>
                        )}
                    </td>
                </tr>
            )}
        </motion.div>
    );
}

function StatsCard({ title, stats, color }) {
    const colorClasses = {
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800'
    };

    // Group transactions by currency and calculate totals
    const currencyTotals = stats.transactions?.reduce((acc, t) => {
        const currency = t.currency || 'XAF';
        if (!acc[currency]) {
            acc[currency] = {
                amount: 0,
                count: 0,
                cardsSent: 0
            };
        }
        acc[currency].amount += t.amount || 0;
        acc[currency].count += 1;
        if (isCardSent(t)) {
            acc[currency].cardsSent += 1;
        }
        return acc;
    }, {}) || {};

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title} Transactions</h3>
            <div className="flex justify-between">
                <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.count}</p>
                    <p className="text-sm text-gray-500">total transactions</p>
                </div>
                <div className="flex flex-col gap-2">
                    {Object.entries(currencyTotals).map(([currency, data]) => (
                        <div key={currency} className="text-right">
                            <div className={`px-3 py-1 rounded-full ${colorClasses[color]}`}>
                                {formatCurrency(data.amount, currency)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {data.count} {currency} transaction{data.count !== 1 ? 's' : ''}
                                {data.cardsSent > 0 && (
                                    <span className="ml-1 text-green-600">
                                        ({data.cardsSent} card{data.cardsSent !== 1 ? 's' : ''} sent)
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getCountryName(code) {
    const countries = {
        'CM': 'Cameroon',
        'SN': 'Senegal',
        'BF': 'Burkina Faso',
        'CI': "Côte d'Ivoire",
        'RW': 'Rwanda',
        'UG': 'Uganda'
    };
    return countries[code] || code;
}

export default Overview; 