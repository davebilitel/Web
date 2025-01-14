import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdvancedAnalytics from '../AdvancedAnalytics';
import Reports from '../Reports';

function Analytics() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
        >
            <h1 className="text-2xl font-bold mb-6">Analytics</h1>
            
            <div className="space-y-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Advanced Analytics</h2>
                    <AdvancedAnalytics />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Reports</h2>
                    <Reports />
                </div>
            </div>
        </motion.div>
    );
}

export default Analytics; 