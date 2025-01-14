/**
 * Utility functions for email-related operations
 */

/**
 * Formats the payment details into a readable string
 */
const formatPaymentDetails = (orderDetails) => {
    const details = [];
    details.push(`Card Type: ${orderDetails.cardType}`);
    details.push(`Amount: ${orderDetails.amount} ${orderDetails.currency}`);
    details.push(`Reference: ${orderDetails.reference}`);
    details.push(`Payment Method: ${orderDetails.paymentMethod}`);
    if (orderDetails.transactionId) {
        details.push(`Transaction ID: ${orderDetails.transactionId}`);
    }
    return details.join('\n');
};

/**
 * Sends an email receipt for a successful payment
 * Note: This is just a wrapper around the API call
 */
export const sendEmailReceipt = async (email, name, orderDetails) => {
    try {
        const response = await fetch('/api/send-receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                name,
                orderDetails
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send email receipt');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending email receipt:', error);
        throw error;
    }
};

export default {
    sendEmailReceipt
}; 