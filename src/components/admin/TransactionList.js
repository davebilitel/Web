import React from 'react';
import { formatCurrency } from '../../utils/currency';

function TransactionList({ transactions, onViewDetails, onUpdateStatus }) {
    const handleViewDetails = (transaction) => {
        if (onViewDetails) onViewDetails(transaction);
    };

    const handleUpdateStatus = (id, status) => {
        if (onUpdateStatus) onUpdateStatus(id, status);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(transaction.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {transaction.user?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {transaction.user?.email || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.user?.phone || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {transaction.cardType || 'N/A'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(transaction.amount, transaction.country)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.paymentMethod}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    transaction.status === 'SUCCESSFUL' 
                                        ? 'bg-green-100 text-green-800'
                                        : transaction.status === 'FAILED'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {transaction.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.country || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleViewDetails(transaction)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    View Details
                                </button>
                                {transaction.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleUpdateStatus(transaction._id, 'FAILED')}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Mark Failed
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionList; 