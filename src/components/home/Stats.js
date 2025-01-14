import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';

function Stats() {
    const { t } = useTranslation();
    
    const stats = [
        { label: t('home.stats.activeUsers'), value: 5000, suffix: "+" },
        { label: t('home.stats.cardsCreated'), value: 10000, suffix: "+" },
        { label: t('home.stats.countries'), value: 7, suffix: "" },
        { label: t('home.stats.successRate'), value: 99, suffix: "%" }
    ];

    return (
        <section className="bg-gray-50 dark:bg-dark-bg-secondary py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-dark-bg-tertiary rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                <CountUp end={stat.value} duration={2.5} />
                                {stat.suffix}
                            </div>
                            <div className="text-gray-600 dark:text-blue-300 mt-2">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Stats; 