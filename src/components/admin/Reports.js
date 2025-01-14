import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';
import Toast from '../ui/Toast';

function Reports() {
    const [reportConfig, setReportConfig] = useState({
        startDate: '',
        endDate: '',
        metrics: [],
        format: 'excel'
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const availableMetrics = [
        { key: 'transactionId', label: 'Transaction ID' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'createdAt', label: 'Date' },
        { key: 'country', label: 'Country' }
    ];

    const handleMetricToggle = (metric) => {
        setReportConfig(prev => ({
            ...prev,
            metrics: prev.metrics.includes(metric) 
                ? prev.metrics.filter(m => m !== metric)
                : [...prev.metrics, metric]
        }));
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/admin/reports/custom', reportConfig, {
                responseType: reportConfig.format === 'excel' ? 'arraybuffer' : 'blob'
            });

            // Create and download file
            const blob = new Blob([response.data], {
                type: reportConfig.format === 'excel' 
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/pdf'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report.${reportConfig.format}`;
            a.click();

            setToast({ show: true, message: 'Report generated successfully', type: 'success' });
        } catch (error) {
            setToast({ show: true, message: 'Failed to generate report', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Report Generator</h2>
            
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            value={reportConfig.startDate}
                            onChange={e => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            value={reportConfig.endDate}
                            onChange={e => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metrics</label>
                    <div className="grid grid-cols-3 gap-4">
                        {availableMetrics.map(metric => (
                            <label key={metric.key} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={reportConfig.metrics.includes(metric)}
                                    onChange={() => handleMetricToggle(metric)}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <span>{metric.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select
                        value={reportConfig.format}
                        onChange={e => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="excel">Excel</option>
                        <option value="pdf">PDF</option>
                    </select>
                </div>

                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            <Toast 
                isVisible={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}

export default Reports; 