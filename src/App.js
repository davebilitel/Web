import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './Routes';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import AccessibilityControl from './components/AccessibilityControl';
import { Toaster } from 'react-hot-toast';
import { MobileProvider } from './context/MobileContext';

function App() {
    return (
        <HelmetProvider>
            <MobileProvider>
                <BrowserRouter>
                    <UserPreferencesProvider>
                        <AppRoutes />
                        <AccessibilityControl />
                        <Toaster position="bottom-center" />
                    </UserPreferencesProvider>
                </BrowserRouter>
            </MobileProvider>
        </HelmetProvider>
    );
}

export default App; 