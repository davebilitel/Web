import React from 'react';
import BalanceRequestsStream from '../BalanceRequestsStream';

function CardBalance() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Card Balance Requests</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage balance check requests from users
                </p>
            </div>
            <BalanceRequestsStream />
        </div>
    );
}

export default CardBalance; 