// Create this new file for error handling logic
export const ERROR_TYPES = {
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION',
    PAYMENT: 'PAYMENT',
    SERVER: 'SERVER'
};

export const getErrorType = (error) => {
    if (!navigator.onLine) return ERROR_TYPES.NETWORK;
    if (error.response?.status === 422) return ERROR_TYPES.VALIDATION;
    if (error.response?.status === 400) return ERROR_TYPES.PAYMENT;
    return ERROR_TYPES.SERVER;
};

export const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

export const getSmartErrorMessage = (error, formData = {}) => {
    const errorType = getErrorType(error);
    const message = error.response?.data?.error || error.message;

    switch (errorType) {
        case ERROR_TYPES.NETWORK:
            return {
                message: 'You appear to be offline',
                suggestion: 'Your progress has been saved. We\'ll retry automatically when you\'re back online.',
                action: 'retry'
            };

        case ERROR_TYPES.VALIDATION:
            if (message.includes('customerEmail')) {
                const email = formData.email?.toLowerCase().trim();
                if (!email) {
                    return {
                        message: 'Email is required',
                        suggestion: 'Please enter your email address',
                        action: 'edit'
                    };
                }
                
                // Check for common email typos
                const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
                const [localPart, domain] = email.split('@');
                
                if (domain) {
                    const suggestedDomain = commonDomains.find(d => 
                        d.length > 3 && domain.length > 3 && 
                        (d.includes(domain) || domain.includes(d))
                    );
                    
                    if (suggestedDomain && domain !== suggestedDomain) {
                        return {
                            message: 'Invalid email address',
                            suggestion: `Did you mean ${localPart}@${suggestedDomain}?`,
                            action: 'edit'
                        };
                    }
                }

                return {
                    message: 'Invalid email format',
                    suggestion: 'Please enter a valid email address (e.g., name@example.com)',
                    action: 'edit'
                };
            }
            if (message.includes('customerPhone')) {
                return {
                    message: 'Invalid phone number',
                    suggestion: formData.country === 'CM' 
                        ? 'Cameroon numbers should start with 237'
                        : 'Please enter a valid mobile number',
                    action: 'edit'
                };
            }
            return {
                message: 'Please check your information',
                suggestion: 'Make sure all required fields are filled correctly',
                action: 'edit'
            };

        case ERROR_TYPES.PAYMENT:
            return {
                message: 'Payment failed',
                suggestion: 'Your bank declined the transaction. Try another payment method or contact your bank.',
                action: 'change_method'
            };

        default:
            return {
                message: 'Something went wrong',
                suggestion: 'Please try again or contact support if the problem persists',
                action: 'retry'
            };
    }
};

export const QueuedRequestsManager = {
    add: (request) => {
        const queue = JSON.parse(localStorage.getItem('paymentQueue') || '[]');
        queue.push({
            ...request,
            timestamp: Date.now(),
            retryCount: 0
        });
        localStorage.setItem('paymentQueue', JSON.stringify(queue));
    },

    process: async () => {
        const queue = JSON.parse(localStorage.getItem('paymentQueue') || '[]');
        if (queue.length === 0) return;

        const request = queue[0];
        try {
            await request.action();
            // Remove successful request from queue
            queue.shift();
            localStorage.setItem('paymentQueue', JSON.stringify(queue));
        } catch (error) {
            if (request.retryCount < 3) {
                request.retryCount++;
                request.nextRetry = Date.now() + (1000 * Math.pow(2, request.retryCount));
                localStorage.setItem('paymentQueue', JSON.stringify(queue));
            } else {
                queue.shift();
                localStorage.setItem('paymentQueue', JSON.stringify(queue));
            }
        }
    }
}; 