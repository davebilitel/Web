// Create a new logger utility
const isDev = process.env.NODE_ENV === 'development';

const logger = {
    info: (message, data = null) => {
        if (isDev) {
            console.log(`[INFO] ${message}`, data || '');
        }
    },
    error: (message, error = null) => {
        // Always log errors, but with different detail levels
        if (isDev) {
            console.error(`[ERROR] ${message}`, error);
        } else {
            // In production, log less detailed error info
            console.error(`[ERROR] ${message}`);
        }
    },
    debug: (message, data = null) => {
        if (isDev) {
            console.debug(`[DEBUG] ${message}`, data || '');
        }
    }
};

export default logger; 