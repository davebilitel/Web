import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CreateCard from '../cards/CreateCard';
import CardBalance from '../cards/CardBalance';
import TopUps from '../cards/TopUps';

function Cards() {
    const [activeTab, setActiveTab] = useState('create');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Cards Management</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === 'create' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Create Card
                    </button>
                    <button
                        onClick={() => setActiveTab('balance')}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === 'balance' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Card Balance
                    </button>
                    <button
                        onClick={() => setActiveTab('topups')}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === 'topups' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Top Ups
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
                {activeTab === 'create' && <CreateCard />}
                {activeTab === 'balance' && <CardBalance />}
                {activeTab === 'topups' && <TopUps />}
            </div>
        </motion.div>
    );
}

export default Cards; 