import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import Cards from './pages/Cards';
import TransactionDetailsModal from './TransactionDetailsModal';
import ProfileEditModal from './ProfileEditModal';
import ExchangeRates from './ExchangeRates';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import MobileNav from './MobileNav';
import CardBalance from './pages/CardBalance';
import EditProfile from './pages/EditProfile';

function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [adminProfile, setAdminProfile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const transactionsPerPage = 10;
    const [startY, setStartY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTransactions();
        fetchAdminProfile();
    }, []);

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.metaKey || e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 'e':
                        e.preventDefault();
                        handleExport();
                        break;
                    case 'r':
                        e.preventDefault();
                        fetchTransactions();
                        break;
                    case 'p':
                        e.preventDefault();
                        setShowProfileModal(true);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(Array.isArray(response.data.transactions) ? response.data.transactions : []);
            setMonthlyStats(response.data.monthlyStats || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/admin/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminProfile(response.data);
        } catch (error) {
            console.error('Error fetching admin profile:', error);
        }
    };

    const handleStatusChange = async (transactionId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const newStatus = currentStatus === 'SUCCESSFUL' ? 'FAILED' : 'SUCCESSFUL';
            
            await axios.patch(
                `/api/admin/transactions/${transactionId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            fetchTransactions(); // Refresh the transactions list
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleProfileUpdate = async (updatedProfile) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.patch('/api/admin/profile', updatedProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminProfile(response.data);
            setShowProfileModal(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const navigation = [
        { name: 'Overview', path: '/admin/dashboard' },
        { name: 'Analytics', path: '/admin/dashboard/analytics' },
        { name: 'Cards', path: '/admin/dashboard/cards' },
        { name: 'Edit Profile', path: '/admin/dashboard/edit-profile' }
    ];

    const handleCheckStatus = async (reference) => {
        try {
            await axios.get(`/api/payment-status/${reference}`);
            fetchTransactions();
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    const handleDeleteSelected = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('/api/admin/transactions/delete', 
                { transactionIds: selectedTransactions },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setSelectedTransactions([]);
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transactions:', error);
        }
    };

    const handleRefresh = useCallback(async () => {
        // Refresh all necessary data
        await Promise.all([
            fetchTransactions(),
            fetchAdminProfile()
            // Add other fetch functions as needed
        ]);
    }, []);

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = async (e) => {
        if (!startY) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 70 && !refreshing && window.scrollY === 0) {
            setRefreshing(true);
            try {
                await handleRefresh();
            } finally {
                setRefreshing(false);
                setStartY(0);
            }
        }
    };

    const handleTouchEnd = () => {
        setStartY(0);
    };

    return (
        <div 
            className="min-h-screen bg-gray-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Refresh Indicator */}
            {refreshing && (
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-blue-500 text-white py-2">
                    <svg 
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Refreshing...
                </div>
            )}

            {/* Header with Admin Profile */}
            <div className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
                    {/* Mobile Header */}
                    <div className="lg:hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={adminProfile?.profileImage} 
                                    alt="Admin Profile"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        {adminProfile?.name}
                                    </h1>
                                    <p className="text-xs text-gray-600">{adminProfile?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm ${
                                        location.pathname === item.path
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img 
                                src={adminProfile?.profileImage} 
                                alt="Admin Profile"
                                className="w-12 h-12 rounded-full"
                            />
                            <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                    Welcome, {adminProfile?.name}
                            </h1>
                                <p className="text-sm text-gray-600">{adminProfile?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`px-4 py-2 rounded ${
                                        location.pathname === item.path
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Logout
                            </button>
                                </div>
                            </div>
                        </div>
                    </div>

            {/* Page Content */}
            <main className="p-4 lg:p-6 pb-20 lg:pb-6">
                <div className="max-w-[1600px] mx-auto">
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <>
                                    <Overview 
                                        transactions={transactions}
                                        monthlyStats={monthlyStats}
                                        loading={loading}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        transactionsPerPage={transactionsPerPage}
                                        selectedTransactions={selectedTransactions}
                                        setSelectedTransactions={setSelectedTransactions}
                                        onStatusChange={handleStatusChange}
                                        onRefresh={fetchTransactions}
                                        onCheckStatus={handleCheckStatus}
                                        onDeleteSelected={handleDeleteSelected}
                                    />
                                    <div className="max-w-7xl mx-auto px-4 py-6">
                                        <ExchangeRates />
                        </div>
                                </>
                            } 
                        />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/cards" element={<Cards />} />
                        <Route path="/card-balance" element={<CardBalance />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                    </Routes>
                </div>
            </main>

            {/* Mobile Quick Actions */}
            <div className="lg:hidden fixed right-4 bottom-20 flex flex-col gap-3">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                        </svg>
                </button>
                                                    <button
                    onClick={handleRefresh}
                    className="bg-green-500 text-white p-3 rounded-full shadow-lg"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                                                    </button>
                </div>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Modals and Tooltips */}
            <ProfileEditModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                adminProfile={adminProfile}
                onUpdate={handleProfileUpdate}
            />
            <Tooltip id="global-tooltip" />
        </div>
    );
}

export default Dashboard; 