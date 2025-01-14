const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generate2FASecret = async (adminEmail) => {
    const secret = speakeasy.generateSecret({
        name: encodeURIComponent(`VirtualServices:${adminEmail}`),
        length: 20 // Shorter secret length
    });

    // Generate otpauth URL manually to ensure proper encoding
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(`VirtualServices:${adminEmail}`)}?secret=${secret.base32}&issuer=VirtualServices`;

    try {
        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
            errorCorrectionLevel: 'L',
            margin: 1,
            width: 200
        });

        return {
            secret: secret.base32,
            qrCode: otpauthUrl // Send the URL instead of the data URL
        };
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw error;
    }
};

const verify2FAToken = (token, secret) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1
    });
};

const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        codes.push({
            code: Math.random().toString(36).substring(2, 12).toUpperCase(),
            used: false
        });
    }
    return codes;
};

module.exports = {
    generate2FASecret,
    verify2FAToken,
    generateBackupCodes
}; 