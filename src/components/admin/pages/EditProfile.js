import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-hot-toast';

function EditProfile() {
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret2FA, setSecret2FA] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [killSwitches, setKillSwitches] = useState({
        visaCardEnabled: localStorage.getItem('visaCardEnabled') !== 'false',
        masterCardEnabled: localStorage.getItem('masterCardEnabled') !== 'false'
    });

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    useEffect(() => {
        if (adminProfile?.profileImage) {
            setPreviewImage(adminProfile.profileImage);
        }
    }, [adminProfile?.profileImage]);

    const fetchAdminProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/admin/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminProfile(response.data);
        } catch (error) {
            console.error('Error fetching admin profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.patch('/api/admin/profile', adminProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminProfile(response.data);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error updating profile. Please try again.');
        }
    };

    const handle2FASetup = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post('/api/admin/2fa/setup', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setQrCode(response.data.qrCode);
            setSecret2FA(response.data.secret);
            setShow2FASetup(true);
        } catch (error) {
            toast.error('Failed to setup 2FA');
            console.error('Error setting up 2FA:', error);
        }
    };

    const handleVerify2FA = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post('/api/admin/2fa/verify', {
                token: verificationCode,
                secret: secret2FA
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setBackupCodes(response.data.backupCodes);
                setAdminProfile(prev => ({
                    ...prev,
                    twoFactorEnabled: true
                }));
                setShow2FASetup(false);
                setShowBackupCodes(true);
                toast.success('2FA enabled successfully!');
            }
        } catch (error) {
            toast.error('Invalid verification code');
            console.error('2FA verification error:', error);
        }
    };

    const handleDisable2FA = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('/api/admin/2fa/disable', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAdminProfile(prev => ({
                ...prev,
                twoFactorEnabled: false
            }));
            toast.success('2FA disabled successfully');
        } catch (error) {
            toast.error('Failed to disable 2FA');
            console.error('Error disabling 2FA:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <img 
                                src={previewImage || adminProfile?.profileImage} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                            />
                            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-white">
                            <h1 className="text-2xl font-bold">{adminProfile?.name}</h1>
                            <p className="text-blue-100">{adminProfile?.email}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                value={adminProfile?.name || ''}
                                onChange={(e) => setAdminProfile({...adminProfile, name: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={adminProfile?.email || ''}
                                onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Profile Image URL
                        </label>
                        <input
                            type="url"
                            value={adminProfile?.profileImage || ''}
                            onChange={(e) => {
                                setAdminProfile({...adminProfile, profileImage: e.target.value});
                                setPreviewImage(e.target.value);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Enter image URL"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* 2FA Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Two-Factor Authentication</h2>
                            <p className="text-purple-100">Enhance your account security</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {!adminProfile?.twoFactorEnabled ? (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Add an extra layer of security to your account by enabling two-factor authentication.
                            </p>
                            <button
                                onClick={handle2FASetup}
                                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Enable 2FA
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="font-medium">2FA is enabled</span>
                                </div>
                                <button
                                    onClick={handleDisable2FA}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Disable 2FA
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2FA Setup Modal */}
                    {show2FASetup && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        >
                            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6">
                                <h3 className="text-xl font-bold">Setup 2FA</h3>
                                
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="flex justify-center">
                                        <QRCodeCanvas 
                                            value={qrCode}
                                            size={200}
                                            level="L"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 text-center">
                                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter verification code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                    <button
                                        onClick={handleVerify2FA}
                                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Backup Codes Modal */}
                    {showBackupCodes && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        >
                            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6">
                                <h3 className="text-xl font-bold">Backup Codes</h3>
                                <p className="text-gray-600">
                                    Save these backup codes in a secure place. You can use them to access your account if you lose your 2FA device.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {backupCodes.map((code, index) => (
                                        <div key={index} className="bg-gray-100 p-2 rounded text-center font-mono">
                                            {code.code}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowBackupCodes(false);
                                        setBackupCodes([]);
                                    }}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                >
                                    I've saved these codes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8">
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Card Purchase Controls</h2>
                            <p className="text-gray-100">Enable or disable card purchases</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Visa Card Purchases</h3>
                            <p className="text-sm text-gray-500">Allow users to purchase Visa virtual cards</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={killSwitches.visaCardEnabled}
                                onChange={(e) => {
                                    const newValue = e.target.checked;
                                    setKillSwitches(prev => ({
                                        ...prev,
                                        visaCardEnabled: newValue
                                    }));
                                    localStorage.setItem('visaCardEnabled', newValue);
                                    toast.success(`Visa card purchases ${newValue ? 'enabled' : 'disabled'}`);
                                }}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer 
                                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 
                                after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Mastercard Purchases</h3>
                            <p className="text-sm text-gray-500">Allow users to purchase Mastercard virtual cards</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={killSwitches.masterCardEnabled}
                                onChange={(e) => {
                                    const newValue = e.target.checked;
                                    setKillSwitches(prev => ({
                                        ...prev,
                                        masterCardEnabled: newValue
                                    }));
                                    localStorage.setItem('masterCardEnabled', newValue);
                                    toast.success(`Mastercard purchases ${newValue ? 'enabled' : 'disabled'}`);
                                }}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer 
                                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 
                                after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile; 