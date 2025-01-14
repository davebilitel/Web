import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TransactionControls = ({ 
    searchTerm, 
    onSearchChange, 
    sortBy, 
    onSortChange,
    totalTransactions,
    currentPage,
    totalPages,
    onPageChange
}) => {
    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by card number, name, or country..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Sort Dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="createdAt:desc">Date (Newest First)</option>
                    <option value="createdAt:asc">Date (Oldest First)</option>
                    <option value="amount:desc">Amount (High to Low)</option>
                    <option value="amount:asc">Amount (Low to High)</option>
                    <option value="status">Status</option>
                    <option value="country">Country</option>
                </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{currentPage}</span> of{' '}
                            <span className="font-medium">{totalPages}</span> ({totalTransactions} total transactions)
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => onPageChange(1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                First
                            </button>
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => onPageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Last
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionControls; 