import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import api from '../api';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const socket = io('http://localhost:5001', {
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

function Codes() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socketStatus, setSocketStatus] = useState('disconnected');

    useEffect(() => {
        // Socket event handlers
        socket.on('connect', () => {
            console.log('Socket connected!');
            setSocketStatus('connected');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected!');
            setSocketStatus('disconnected');
        });

        socket.on('newMessage', (message) => {
            console.log('Received new message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await api.get('/sms');
                setMessages(response.data || []);
            } catch (err) {
                setError('Failed to fetch messages');
                console.error('Error fetching messages:', err);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Cleanup
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('newMessage');
        };
    }, []);

    const refreshMessages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sms');
            setMessages(response.data || []);
        } catch (err) {
            console.error('Error refreshing messages:', err);
            setError('Failed to refresh messages');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        SMS Messages
                    </h1>
                    <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            socketStatus === 'connected' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {socketStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                        <button
                            onClick={refreshMessages}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                        <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                                    {error}
                                </h3>
                            </div>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No messages received yet
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-6"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            From: {message.from}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(message.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                                        {message.body}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Codes; 