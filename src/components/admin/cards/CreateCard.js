import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Toast from '../../ui/Toast';

function PurchaseStreamItem({ purchase, onProcess }) {
    const getCardTypeIcon = (type) => {
        switch (type?.toUpperCase()) {
            case 'VISA':
                return (
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        VISA
                    </div>
                );
            case 'MASTERCARD':
                return (
                    <div className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                        MASTERCARD
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-gray-900">{purchase.customerName}</div>
                    {getCardTypeIcon(purchase.cardType)}
                </div>
                <div className="text-sm text-gray-500">{purchase.customerEmail}</div>
                <div className="text-xs text-gray-400 mt-1">
                    {purchase.timeAgo} • {purchase.paymentMethod}
                </div>
            </div>
            <button
                onClick={() => onProcess(purchase)}
                className="ml-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
                Process
            </button>
        </div>
    );
}

// Add this new component for the mobile form modal
function MobileFormModal({ 
    isOpen, 
    onClose, 
    formData, 
    setFormData, 
    handleSubmit, 
    loading,
    formatCardNumber,
    formatExpiryDate 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
                <div className="fixed inset-0" onClick={onClose}></div>
                
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Send Card to Customer
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={(e) => {
                        handleSubmit(e);
                        onClose();
                    }} className="space-y-6">
                        {/* Card Type Section */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Card Type</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 border rounded-lg p-4 cursor-pointer ${formData.type === 'VISA' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="VISA"
                                        checked={formData.type === 'VISA'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="hidden"
                                    />
                                    <span className="block text-center text-base font-medium">Visa</span>
                                </label>
                                <label className={`flex-1 border rounded-lg p-4 cursor-pointer ${formData.type === 'MASTERCARD' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="MASTERCARD"
                                        checked={formData.type === 'MASTERCARD'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="hidden"
                                    />
                                    <span className="block text-center text-base font-medium">Mastercard</span>
                                </label>
                            </div>
                        </div>

                        {/* Card Details Section */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Card Number</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9\s]*"
                                    value={formData.cardNumber}
                                    onChange={(e) => {
                                        const formatted = formatCardNumber(e.target.value);
                                        setFormData({ ...formData, cardNumber: formatted });
                                    }}
                                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="1234 5678 9012 3456"
                                    required
                                    maxLength="19"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">CVV</label>
                                    <input
                                        type="text"
                                        value={formData.cvv}
                                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                        className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="123"
                                        required
                                        maxLength="4"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Expiry Date</label>
                                    <input
                                        type="text"
                                        value={formData.expiryDate}
                                        onChange={(e) => {
                                            const formatted = formatExpiryDate(e.target.value);
                                            setFormData({ ...formData, expiryDate: formatted });
                                        }}
                                        className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="MM/YY"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer Information Section */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Customer Name</label>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Customer Email</label>
                                <input
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter customer email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Balance Section */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Initial Balance</label>
                            <input
                                type="number"
                                value={formData.balance}
                                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter initial balance"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-base font-medium"
                        >
                            {loading ? 'Sending...' : 'Send Card'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function CreateCard() {
    const [formData, setFormData] = useState({
        type: 'VISA',
        cardNumber: '',
        cvv: '',
        expiryDate: '',
        customerName: '',
        customerEmail: '',
        balance: '',
        purchaseId: null
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [sentCards, setSentCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [showMobileForm, setShowMobileForm] = useState(false);

    // Fetch sent cards on component mount
    React.useEffect(() => {
        fetchSentCards();
    }, []);

    const fetchSentCards = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/admin/sent-cards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSentCards(response.data);
        } catch (error) {
            console.error('Error fetching sent cards:', error);
        }
    };

    // Add validation function
    const validateCardNumber = (number) => {
        // Remove spaces and check if it's exactly 16 digits
        const cleaned = number.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleaned)) return false;
        
        // Luhn algorithm check (optional)
        return true;
    };

    // Add these formatting functions
    const formatCardNumber = (value) => {
        // Remove all non-digit characters
        const cleaned = value.replace(/\D/g, '');
        
        // Limit to 16 digits
        const truncated = cleaned.slice(0, 16);
        
        // Add spaces after every 4 digits
        const formatted = truncated.replace(/(\d{4})(?=\d)/g, '$1 ');
        
        return formatted;
    };

    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateCardNumber(formData.cardNumber)) {
            setToast({
                show: true,
                message: 'Please enter a valid 16-digit card number',
                type: 'error'
            });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post('/api/admin/send-card', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If this was a processed purchase, mark it as completed
            if (formData.purchaseId) {
                await axios.post(`/api/admin/card-purchases/${formData.purchaseId}/process`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Remove the purchase from the stream only after successful card sending
                setPurchases(purchases.filter(p => p.purchaseId !== formData.purchaseId));
            }

            setToast({ show: true, message: 'Card sent successfully', type: 'success' });
            setFormData({
                type: 'VISA',
                cardNumber: '',
                cvv: '',
                expiryDate: '',
                customerName: '',
                customerEmail: '',
                balance: '',
                purchaseId: null // Clear the purchaseId
            });
            fetchSentCards(); // Refresh the list
        } catch (error) {
            setToast({ 
                show: true, 
                message: error.response?.data?.error || 'Failed to send card', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredCards = sentCards
        .filter(card => {
            const matchesSearch = card.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                card.cardId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || card.type === filterType;
            return matchesSearch && matchesType;
        });

    const exportToCSV = () => {
        const headers = ['Card ID', 'Customer Name', 'Card Type', 'Date Created'];
        const csvData = sentCards.map(card => [
            card.cardId,
            card.customerName,
            card.type,
            new Date(card.createdAt).toLocaleDateString()
        ]);
        
        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sent-cards.csv';
        a.click();
    };

    // Add loading spinner component
    function LoadingSpinner() {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const handleResendEmail = async (card) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('/api/admin/resend-card', 
                { cardId: card.cardId },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setToast({ show: true, message: 'Card details resent successfully', type: 'success' });
        } catch (error) {
            setToast({ 
                show: true, 
                message: error.response?.data?.error || 'Failed to resend card details', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (card) => {
        if (!window.confirm('Are you sure you want to deactivate this card?')) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.patch(`/api/admin/cards/${card._id}/status`, 
                { status: 'INACTIVE' },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setToast({ show: true, message: 'Card deactivated successfully', type: 'success' });
            fetchSentCards(); // Refresh the list
        } catch (error) {
            setToast({ 
                show: true, 
                message: error.response?.data?.error || 'Failed to deactivate card', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (card) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`/api/admin/cards/${card.cardId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setToast({ show: true, message: 'Card deleted successfully', type: 'success' });
            fetchSentCards(); // Refresh the list
        } catch (error) {
            setToast({ 
                show: true, 
                message: error.response?.data?.error || 'Failed to delete card', 
                type: 'error' 
            });
        }
    };

    const fetchPurchases = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/admin/card-purchases', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPurchases(response.data);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        }
    }, []);

    useEffect(() => {
        fetchPurchases();
        const interval = setInterval(fetchPurchases, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchPurchases]);

    const handleProcessPurchase = async (purchase) => {
        try {
            // Update form data with purchase details and include purchaseId
            setFormData({
                ...formData,
                customerName: purchase.customerName,
                customerEmail: purchase.customerEmail,
                balance: purchase.amount,
                type: purchase.cardType || 'VISA',
                purchaseId: purchase.purchaseId
            });

            // Show mobile form if on mobile, otherwise scroll to form
            if (window.innerWidth < 1024) {
                setShowMobileForm(true);
            } else {
                document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to process purchase',
                type: 'error'
            });
        }
    };

    return (
        <div className="lg:flex gap-6 min-h-[calc(100vh-120px)] block pb-20 lg:pb-6">
            {/* Left Panel - Card Creation Form (hidden on mobile) */}
            <div className="hidden lg:block lg:w-1/3 w-full bg-white rounded-lg shadow p-4 lg:p-6 mb-4 lg:mb-0 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-8">Send Card to Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Card Type Section */}
                    <div>
                        <label className="text-lg font-medium text-gray-700 mb-3 block">Card Type</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 border rounded-lg p-6 cursor-pointer ${formData.type === 'VISA' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="VISA"
                                    checked={formData.type === 'VISA'}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="hidden"
                                />
                                <span className="block text-center text-lg font-medium">Visa</span>
                            </label>
                            <label className={`flex-1 border rounded-lg p-6 cursor-pointer ${formData.type === 'MASTERCARD' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="MASTERCARD"
                                    checked={formData.type === 'MASTERCARD'}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="hidden"
                                />
                                <span className="block text-center text-lg font-medium">Mastercard</span>
                            </label>
                        </div>
                    </div>

                    {/* Card Details Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="text-lg font-medium text-gray-700 mb-2 block">Card Number</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9\s]*"
                                value={formData.cardNumber}
                                onChange={(e) => {
                                    const formatted = formatCardNumber(e.target.value);
                                    setFormData({ ...formData, cardNumber: formatted });
                                }}
                                className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="1234 5678 9012 3456"
                                required
                                maxLength="19"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-lg font-medium text-gray-700 mb-2 block">CVV</label>
                                <input
                                    type="text"
                                    value={formData.cvv}
                                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="123"
                                    required
                                    maxLength="4"
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium text-gray-700 mb-2 block">Expiry Date</label>
                                <input
                                    type="text"
                                    value={formData.expiryDate}
                                    onChange={(e) => {
                                        const formatted = formatExpiryDate(e.target.value);
                                        setFormData({ ...formData, expiryDate: formatted });
                                    }}
                                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="MM/YY"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customer Information Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="text-lg font-medium text-gray-700 mb-2 block">Customer Name</label>
                            <input
                                type="text"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter customer name"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-lg font-medium text-gray-700 mb-2 block">Customer Email</label>
                            <input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter customer email"
                                required
                            />
                        </div>
                    </div>

                    {/* Balance Section */}
                    <div>
                        <label className="text-lg font-medium text-gray-700 mb-2 block">Initial Balance</label>
                        <input
                            type="number"
                            value={formData.balance}
                            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                            className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter initial balance"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-lg font-medium mt-8"
                    >
                        {loading ? 'Sending...' : 'Send Card'}
                    </button>
                </form>
            </div>

            {/* Right Panel */}
            <div className="lg:w-2/3 w-full space-y-6">
                {/* Purchase Stream Section */}
                {purchases.length > 0 && (
                    <div className="bg-gray-50 rounded-lg shadow p-4 lg:p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <span className="mr-2">Recent Card Purchases</span>
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </h2>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {purchases.map((purchase) => (
                                <PurchaseStreamItem
                                    key={purchase.purchaseId}
                                    purchase={purchase}
                                    onProcess={handleProcessPurchase}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Sent Cards Section */}
                <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-4 lg:space-y-0">
                        <h2 className="text-xl font-semibold">Sent Cards</h2>
                        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                            <input
                                type="text"
                                placeholder="Search by name or card ID..."
                                className="px-4 py-2 border rounded-lg w-full lg:w-auto"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border rounded-lg w-full lg:w-auto"
                            >
                                <option value="all">All Types</option>
                                <option value="VISA">Visa</option>
                                <option value="MASTERCARD">Mastercard</option>
                            </select>
                            <button
                                onClick={exportToCSV}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full lg:w-auto"
                            >
                                Export to CSV
                            </button>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block lg:hidden">
                        {isLoading ? <LoadingSpinner /> : (
                            <div className="space-y-4">
                                {filteredCards.map((card) => (
                                    <div key={card.cardId} className="bg-white border rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="font-medium text-gray-900">{card.customerName}</div>
                                                <div className="text-sm text-gray-500">{card.customerEmail}</div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {card.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div>
                                                <div className="text-gray-500">Card ID</div>
                                                <div>{card.cardId}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Type</div>
                                                <div>{card.type}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Card Number</div>
                                                <div className="font-mono">
                                                    {card.firstSixDigits}******{card.lastFourDigits}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Sent Date</div>
                                                <div>{new Date(card.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t">
                                            <button
                                                onClick={() => handleResendEmail(card)}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm"
                                            >
                                                Resend Email
                                            </button>
                                            <button
                                                onClick={() => handleDeactivate(card)}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        {isLoading ? <LoadingSpinner /> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Card ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Card Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Card Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sent Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCards.map((card) => (
                                        <tr key={card.cardId}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {card.cardId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {card.customerName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {card.customerEmail}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {card.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono">
                                                    {card.firstSixDigits}******{card.lastFourDigits}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(card.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {card.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleResendEmail(card)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Resend Email
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeactivate(card)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        Deactivate
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCardToDelete(card);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Form Modal */}
            <MobileFormModal
                isOpen={showMobileForm}
                onClose={() => setShowMobileForm(false)}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                loading={loading}
                formatCardNumber={formatCardNumber}
                formatExpiryDate={formatExpiryDate}
            />

            <Toast
                isVisible={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />

            {/* Add Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Card</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this card? This action cannot be undone.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={() => {
                                        handleDelete(cardToDelete);
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateCard; 