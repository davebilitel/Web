import axiosInstance from './axios';

let currentRates = {
    CM: { USD: 620, currency: 'XAF' },
    SN: { USD: 655, currency: 'XOF' },
    BF: { USD: 655, currency: 'XOF' },
    CI: { USD: 655, currency: 'XOF' },
    RW: { USD: 1200, currency: 'RWF' },
    UG: { USD: 3800, currency: 'UGX' },
    KE: { USD: 150, currency: 'KES' }
};

export const updateExchangeRates = async () => {
    try {
        const response = await axiosInstance.get('/api/admin/exchange-rates');
        response.data.forEach(rate => {
            currentRates[rate.country] = {
                USD: rate.rateToUSD,
                currency: getCurrencyForCountry(rate.country)
            };
        });
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
    }
};

const getCurrencyForCountry = (country) => {
    switch (country) {
        case 'CM':
            return 'XAF';
        case 'RW':
            return 'RWF';
        case 'UG':
            return 'UGX';
        case 'KE':
            return 'KES';
        case 'SN':
        case 'BF':
        case 'CI':
            return 'XOF';
        default:
            return 'XAF';
    }
};

export const convertToLocalCurrency = (usdAmount, country) => {
    const rate = currentRates[country]?.USD || currentRates.CM.USD;
    return Math.round(usdAmount * rate);
};

export const formatCurrency = (amount, countryOrCurrency = 'USD') => {
    try {
        // If no amount provided, return empty string
        if (amount === undefined || amount === null) {
            return '';
        }

        // Handle both country codes and currency codes
        const currencyCode = countryOrCurrency?.length === 2 
            ? getCurrencyFromCountry(countryOrCurrency)
            : countryOrCurrency;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        console.warn(`Failed to format currency: ${error.message}`);
        // Fallback formatting
        return `${countryOrCurrency} ${Number(amount).toFixed(2)}`;
    }
};

export const getCurrencyCode = (country) => {
    return currentRates[country]?.currency || getCurrencyForCountry(country);
};

export const getCurrencyFromCountry = (countryCode) => {
    const currencyMap = {
        'CM': 'XAF', // Cameroon - Central African CFA franc
        'SN': 'XOF', // Senegal - West African CFA franc
        'BF': 'XOF', // Burkina Faso - West African CFA franc
        'CI': 'XOF', // Côte d'Ivoire - West African CFA franc
        'RW': 'RWF', // Rwanda - Rwandan franc
        'UG': 'UGX', // Uganda - Ugandan shilling
        'KE': 'KES'  // Kenya - Kenyan shilling
    };
    return currencyMap[countryCode] || 'USD';
};

// Call this when your app initializes
updateExchangeRates(); 