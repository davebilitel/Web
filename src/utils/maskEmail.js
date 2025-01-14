// Create a new utility function for email masking
export const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
        return `${localPart}****@${domain}`;
    }
    return `${localPart.slice(0, 3)}****@${domain}`;
}; 