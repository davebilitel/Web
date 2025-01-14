import React from 'react';

function LoadingSkeleton({ type = 'line' }) {
    switch (type) {
        case 'card':
            return (
                <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            );
        case 'table-row':
            return (
                <tr className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </td>
                </tr>
            );
        default:
            return <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>;
    }
}

export default LoadingSkeleton; 