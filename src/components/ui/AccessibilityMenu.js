import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Switch } from '@headlessui/react';

function AccessibilityMenu({ isOpen, onClose, onToggleButtons, hideButtons }) {
    const { preferences, updateAccessibility, resetToDefaults } = useUserPreferences();
    const { accessibility } = preferences;
    const menuRef = useRef(null);

    useScrollLock(isOpen);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Focus trap
            const focusableElements = menuRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements?.[0];
            const lastElement = focusableElements?.[focusableElements.length - 1];

            firstElement?.focus();

            const handleTab = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            };

            document.addEventListener('keydown', handleTab);
            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.removeEventListener('keydown', handleTab);
            };
        }
    }, [isOpen, onClose]);

    // Helper function for switch labels
    const SwitchLabel = ({ title, description, tooltip }) => (
        <div className="flex items-center gap-2">
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{title}</span>
                {description && (
                    <span className="text-xs text-gray-500">{description}</span>
                )}
            </div>
            {tooltip && (
                <div className="group relative">
                    <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg">
                        {tooltip}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                </div>
            )}
        </div>
    );

    // Add safe toggle handler
    const handleToggleButtons = () => {
        try {
            onToggleButtons();
        } catch (error) {
            console.warn('Error toggling buttons:', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container - ensures perfect centering */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 30 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="a11y-title"
                            ref={menuRef}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 id="a11y-title" className="text-xl font-semibold text-gray-900">
                                    Accessibility Settings
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close accessibility menu"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <SwitchLabel 
                                            title="Quick Action Buttons" 
                                            description="Show/hide Balance & Top Up buttons"
                                            tooltip="Quick access buttons for checking balance and topping up your card"
                                        />
                                        <Switch
                                            checked={!hideButtons}
                                            onChange={handleToggleButtons}
                                            className={`${
                                                !hideButtons ? 'bg-blue-600' : 'bg-gray-200'
                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                                        >
                                            <span className="sr-only">Toggle Balance and Top Up buttons</span>
                                            <span
                                                className={`${
                                                    !hideButtons ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </div>

                                    <div className="border-t border-gray-100 -mx-6 my-4" />

                                    {/* Text Size */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-900">
                                            Text Size
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Default', 'Large', 'Extra Large'].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => updateAccessibility('textSize', size.toLowerCase())}
                                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                                                        ${accessibility.textSize === size.toLowerCase()
                                                            ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Contrast */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-900">
                                            Contrast
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Normal', 'High', 'Maximum'].map((contrast) => (
                                                <button
                                                    key={contrast}
                                                    onClick={() => {
                                                        try {
                                                            updateAccessibility('contrast', contrast.toLowerCase());
                                                        } catch (error) {
                                                            console.warn('Error updating contrast:', error);
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                                                        ${accessibility.contrast === contrast.toLowerCase()
                                                            ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {contrast}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Motion */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-900">
                                            Motion
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['All', 'Reduced', 'None'].map((motion) => (
                                                <button
                                                    key={motion}
                                                    onClick={() => updateAccessibility('motion', motion.toLowerCase())}
                                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                                                        ${accessibility.motion === motion.toLowerCase()
                                                            ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {motion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Mode */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-900">
                                            Color Mode
                                        </label>
                                        <select
                                            value={accessibility.colorMode || 'normal'}
                                            onChange={(e) => updateAccessibility('colorMode', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg text-sm bg-gray-50 border-gray-200 
                                                     focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="deuteranopia">Deuteranopia</option>
                                            <option value="protanopia">Protanopia</option>
                                            <option value="tritanopia">Tritanopia</option>
                                        </select>
                                    </div>

                                    {/* Other Settings */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <SwitchLabel 
                                                title="Screen Reader Descriptions" 
                                                tooltip="Enable descriptions for screen readers"
                                            />
                                            <Switch
                                                checked={accessibility.screenReader}
                                                onChange={(checked) => updateAccessibility('screenReader', checked)}
                                                className={`${
                                                    accessibility.screenReader ? 'bg-blue-600' : 'bg-gray-200'
                                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                                            >
                                                <span className="sr-only">Enable screen reader descriptions</span>
                                                <span
                                                    className={`${
                                                        accessibility.screenReader ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <SwitchLabel 
                                                title="Enhanced Keyboard Navigation" 
                                                tooltip="Improve navigation using the keyboard"
                                            />
                                            <Switch
                                                checked={accessibility.keyboardNav}
                                                onChange={(checked) => updateAccessibility('keyboardNav', checked)}
                                                className={`${
                                                    accessibility.keyboardNav ? 'bg-blue-600' : 'bg-gray-200'
                                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                                            >
                                                <span className="sr-only">Enable keyboard navigation</span>
                                                <span
                                                    className={`${
                                                        accessibility.keyboardNav ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <SwitchLabel 
                                                title="Voice Navigation" 
                                                description="Press Ctrl+V to activate voice commands"
                                                tooltip="Use voice commands to navigate the application"
                                            />
                                            <Switch
                                                checked={accessibility.voiceNav}
                                                onChange={(checked) => updateAccessibility('voiceNav', checked)}
                                                className={`${
                                                    accessibility.voiceNav ? 'bg-blue-600' : 'bg-gray-200'
                                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                                            >
                                                <span className="sr-only">Enable voice navigation</span>
                                                <span
                                                    className={`${
                                                        accessibility.voiceNav ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </div>

                                        {/* Voice commands info */}
                                        {accessibility.voiceNav && (
                                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                                                <p className="font-medium text-gray-900 mb-2">Available Voice Commands:</p>
                                                <ul className="space-y-1 text-gray-600">
                                                    <li>"check balance" - Open balance checker</li>
                                                    <li>"top up" - Open top up menu</li>
                                                    <li>"hide buttons" - Hide action buttons</li>
                                                    <li>"show buttons" - Show action buttons</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={onClose}
                                    className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium
                                             hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 
                                             transition-colors"
                                >
                                    Close
                                </button>
                                
                                <button
                                    onClick={() => {
                                        resetToDefaults();
                                        onClose();
                                    }}
                                    className="w-full py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg 
                                             text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-900 
                                             focus:ring-offset-2 transition-colors"
                                >
                                    Reset to Defaults
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export default AccessibilityMenu; 