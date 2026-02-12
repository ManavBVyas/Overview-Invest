const EXCHANGE_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.45
};

export const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'INR': return '₹';
        default: return '$';
    }
};

/**
 * Formats and converts a value from USD to the target currency.
 * @param {number} valueInUSD - The amount in USD
 * @param {string} targetCurrency - The currency to convert to (USD, EUR, GBP, INR)
 * @returns {string} Formatted string with converted value and symbol
 */
export const formatCurrency = (valueInUSD, targetCurrency = 'INR') => {
    // Force INR as per user requirement "all price are avilable in only indian currency"
    targetCurrency = 'INR';

    const symbol = getCurrencySymbol(targetCurrency);
    const rate = EXCHANGE_RATES[targetCurrency] || 1;
    const convertedValue = parseFloat(valueInUSD || 0) * rate;

    return `${symbol}${convertedValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};
