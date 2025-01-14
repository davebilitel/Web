import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/config';
import App from './App';
import './index.css';
import { useDarkMode } from './hooks/useDarkMode';

// Initialize dark mode on app load
const savedMode = localStorage.getItem('darkMode');
if (savedMode === 'true') {
  document.documentElement.classList.add('dark');
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 