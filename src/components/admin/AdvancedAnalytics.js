import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function AdvancedAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/admin/advanced-analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch analytics data');
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Safe calculation functions
    const calculatePercentage = (value, total) => {
        if (!value || !total || total === 0) return 0;
        return ((value / total) * 100).toFixed(1);
    };

    const getMetric = (path) => {
        return path.split('.').reduce((obj, key) => obj?.[key], data) || 0;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>Error: {error}</p>
                <button 
                    onClick={fetchData}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
                    <p className="text-3xl font-bold">
                        {calculatePercentage(
                            getMetric('conversions.successful'),
                            getMetric('conversions.total')
                        )}%
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Average Transaction</h3>
                    <p className="text-3xl font-bold">
                        {getMetric('averageTransaction').toLocaleString()} XAF
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Monthly Growth</h3>
                    <p className="text-3xl font-bold">
                        {calculatePercentage(
                            getMetric('growth.current'),
                            getMetric('growth.previous')
                        )}%
                    </p>
                </div>
            </div>

            {/* Additional metrics and charts */}
            {data?.charts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add your charts here with proper null checking */}
                </div>
            )}
        </div>
    );
}

export default AdvancedAnalytics; 