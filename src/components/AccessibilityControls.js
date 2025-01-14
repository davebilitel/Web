import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AccessibilityControls() {
    const { fontSize, setFontSize } = useAccessibility();

    return (
        <div 
            className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4"
            role="region"
            aria-label="Accessibility controls"
        >
            <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="h-5 w-5" />
                <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="rounded-lg border p-1"
                    aria-label="Font size"
                >
                    <option value="small">Small Text</option>
                    <option value="normal">Normal Text</option>
                    <option value="large">Large Text</option>
                </select>
            </div>
        </div>
    );
} 