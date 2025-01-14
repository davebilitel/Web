import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function QuickActions({ onAction }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Export CSV',
            shortcut: '⌘E',
            icon: '📊',
            action: () => onAction('export-csv')
        },
        {
            label: 'Refresh Data',
            shortcut: '⌘R',
            icon: '🔄',
            action: () => onAction('refresh')
        },
        {
            label: 'Toggle Analytics',
            shortcut: '⌘A',
            icon: '📈',
            action: () => onAction('toggle-analytics')
        },
        {
            label: 'Edit Profile',
            shortcut: '⌘P',
            icon: '👤',
            action: () => onAction('edit-profile')
        }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 fixed bottom-6 right-6 z-50"
                title="Quick Actions (Press Q)"
            >
                <span className="text-2xl">⚡</span>
            </button>

            {isOpen && (
                <div className="fixed bottom-20 right-6 bg-white rounded-lg shadow-xl p-2 w-64 z-50">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                action.action();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center justify-between group"
                        >
                            <span className="flex items-center">
                                <span className="mr-2">{action.icon}</span>
                                {action.label}
                            </span>
                            <span className="text-xs text-gray-500 group-hover:text-gray-700">
                                {action.shortcut}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default QuickActions; 