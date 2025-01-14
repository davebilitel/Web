import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Analytics() {
    const [period, setPeriod] = useState('monthly');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`/api/admin/analytics?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error.message || 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
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
                    onClick={fetchAnalytics}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Safely calculate success rate
    const calculateSuccessRate = () => {
        if (!analytics?.successRate?.total) return 0;
        const { successful, total } = analytics.successRate.total;
        if (!total) return 0;
        return ((successful / total) * 100).toFixed(1);
    };

    // Safely get payment method success rates
    const getPaymentMethodSuccessRates = () => {
        if (!analytics?.successRate?.byPaymentMethod) return {};
        return Object.entries(analytics.successRate.byPaymentMethod).reduce((acc, [method, data]) => {
            acc[method] = data.total ? ((data.successful / data.total) * 100) : 0;
            return acc;
        }, {});
    };

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm p-2"
                >
                    <option value="daily">Last 30 Days</option>
                    <option value="weekly">Last 90 Days</option>
                    <option value="monthly">Last 12 Months</option>
                </select>
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold">
                        {(analytics?.revenue?.total || 0).toLocaleString()} XAF
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                    <p className="text-3xl font-bold">{calculateSuccessRate()}%</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">New Users</h3>
                    <p className="text-3xl font-bold">
                        {analytics?.userGrowth?.newUsers || 0}
                    </p>
                </div>
            </div>

            {/* Revenue Chart */}
            {analytics?.revenue?.byPeriod && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                    <Line
                        data={{
                            labels: Object.keys(analytics.revenue.byPeriod),
                            datasets: [{
                                label: 'Revenue',
                                data: Object.values(analytics.revenue.byPeriod),
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }]
                        }}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>
            )}

            {/* Payment Methods Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics?.revenue?.byPaymentMethod && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                        <Pie
                            data={{
                                labels: Object.keys(analytics.revenue.byPaymentMethod),
                                datasets: [{
                                    data: Object.values(analytics.revenue.byPaymentMethod),
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.5)',
                                        'rgba(54, 162, 235, 0.5)',
                                        'rgba(255, 206, 86, 0.5)',
                                    ]
                                }]
                            }}
                        />
                    </div>
                )}

                {analytics?.successRate?.byPaymentMethod && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Success Rate by Payment Method</h3>
                        <Bar
                            data={{
                                labels: Object.keys(getPaymentMethodSuccessRates()),
                                datasets: [{
                                    label: 'Success Rate (%)',
                                    data: Object.values(getPaymentMethodSuccessRates()),
                                    backgroundColor: 'rgba(75, 192, 192, 0.5)'
                                }]
                            }}
                            options={{
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Export Options */}
            <div className="flex justify-end space-x-4">
                <button
                    onClick={() => window.location.href = '/api/admin/export?format=csv'}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    Export CSV
                </button>
                <button
                    onClick={() => window.location.href = '/api/admin/export?format=excel'}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Export Excel
                </button>
            </div>
        </div>
    );
}

export default Analytics; 