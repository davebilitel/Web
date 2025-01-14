import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import Toast from '../ui/Toast';

const ExchangeRates = () => {
    const [rates, setRates] = useState({
        CM: '',
        SN: '',
        BF: '',
        CI: '',
        RW: '',
        UG: '',
        KE: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/exchange-rates');
            const rateData = response.data.reduce((acc, rate) => {
                acc[rate.country] = rate.rateToUSD;
                return acc;
            }, {});
            setRates(prev => ({
                ...prev,
                ...rateData
            }));
        } catch (error) {
            console.error('Error fetching rates:', error);
            showToast('Failed to fetch exchange rates', 'error');
        }
    };

    const handleRateChange = (country, value) => {
        setRates(prev => ({
            ...prev,
            [country]: value
        }));
    };

    const updateRate = async (country) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            await axiosInstance.put(`/api/admin/exchange-rates/${country}`, 
                { rateToUSD: parseFloat(rates[country]) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Exchange rate updated successfully', 'success');
            await fetchRates(); // Refresh rates after update
        } catch (error) {
            console.error('Error updating rate:', error);
            showToast('Failed to update exchange rate', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const countryConfig = {
        CM: { name: 'Cameroon', currency: 'XAF' },
        SN: { name: 'Senegal', currency: 'XOF' },
        BF: { name: 'Burkina Faso', currency: 'XOF' },
        CI: { name: 'Côte d\'Ivoire', currency: 'XOF' },
        RW: { name: 'Rwanda', currency: 'RWF' },
        UG: { name: 'Uganda', currency: 'UGX' },
        KE: { name: 'Kenya', currency: 'KES' }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Exchange Rates</h2>
            <div className="grid gap-6">
                {Object.entries(countryConfig).map(([country, config]) => (
                    <div key={country} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{config.name} ({config.currency})</h3>
                        <div className="flex items-center space-x-4">
                            <input
                                type="number"
                                value={rates[country]}
                                onChange={(e) => handleRateChange(country, e.target.value)}
                                placeholder={`Enter rate for ${config.currency}`}
                                className="flex-1 px-3 py-2 border rounded"
                            />
                            <button
                                onClick={() => updateRate(country)}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <Toast 
                isVisible={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ show: false, message: '', type: 'success' })}
            />
        </div>
    );
};

export default ExchangeRates; 