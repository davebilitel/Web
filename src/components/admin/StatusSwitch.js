import React from 'react';

function StatusSwitch({ status, onUpdate }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESSFUL':
                return 'bg-green-100 text-green-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleClick = () => {
        const newStatus = status === 'SUCCESSFUL' ? 'FAILED' : 'SUCCESSFUL';
        onUpdate(newStatus);
    };

    return (
        <button
            onClick={handleClick}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(status)}`}
        >
            {status}
        </button>
    );
}

export default StatusSwitch; 