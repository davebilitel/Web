import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', label: 'EN', flag: '🇬🇧' },
        { code: 'fr', label: 'FR', flag: '🇫🇷' }
    ];

    return (
        <div className="flex space-x-2">
            {languages.map((lang) => (
                <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        i18n.language === lang.code
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.label}
                </motion.button>
            ))}
        </div>
    );
}

export default LanguageSwitcher; 