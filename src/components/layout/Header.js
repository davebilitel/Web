import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useDarkMode } from '../../hooks/useDarkMode';
import MobileMenu from './MobileMenu';
import { useTranslation } from 'react-i18next';

function Header() {
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useDarkMode();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);

    const navigation = [
        { name: t('header.menu.home'), href: '/' },
        { name: t('header.menu.visa'), href: '/visa' },
        { name: t('header.menu.mastercard'), href: '/mastercard' },
        { name: t('header.menu.balance'), href: '/balance' },
        { name: t('header.menu.topUp'), href: '/top-up' },
        { name: t('header.menu.faq'), href: '/faq' },
        { name: t('header.menu.about'), href: '/about' },
        { name: t('header.menu.contact'), href: '/contact' }
    ];

    return (
        <header className="bg-white dark:bg-dark-bg-secondary shadow-md">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            Logo
                        </Link>
                    </div>
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`text-sm font-medium ${
                                    location.pathname === item.href
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">{t('header.openMenu')}</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <DarkModeToggle />
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            <Dialog as="div" className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                <div className="fixed inset-0 z-10" />
                <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white dark:bg-dark-bg-secondary px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="-m-1.5 p-1.5">
                            <span className="text-2xl font-bold text-blue-600">Logo</span>
                        </Link>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">{t('header.closeMenu')}</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                                            location.pathname === item.href
                                                ? 'text-blue-600'
                                                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="py-6">
                                <DarkModeToggle />
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </Dialog>

            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)}
                navItems={navigation}
                onTryDemo={() => setShowDemoModal(true)}
            />
        </header>
    );
}

export default Header; 