import React from 'react';
import BalanceRequestsStream from '../BalanceRequestsStream';

function CardBalance() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Card Balance Requests</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage balance check requests from users
                </p>
            </div>
            
            {/* Balance Requests Stream */}
            <div className="max-w-5xl mx-auto">
                <BalanceRequestsStream />
            </div>
        </div>
    );
}

export default CardBalance; 