import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    PhoneIcon, 
    EnvelopeIcon, 
    MapPinIcon, 
    ClockIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import BackgroundEffect from '../BackgroundEffect';

// Add social media icons
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaWhatsapp,
    FaFacebookMessenger
} from 'react-icons/fa';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        department: 'general'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const departments = [
        { id: 'general', name: 'General Inquiry' },
        { id: 'technical', name: 'Technical Support' },
        { id: 'billing', name: 'Billing Support' },
        { id: 'partnership', name: 'Business Partnership' }
    ];

    const contactInfo = [
        {
            icon: PhoneIcon,
            title: "Call Us",
            details: [
                "+1 (234) 567-8900",
                "+1 (234) 567-8901"
            ],
            color: "text-blue-500"
        },
        {
            icon: EnvelopeIcon,
            title: "Email Us",
            details: [
                "support@cardstore.com",
                "business@cardstore.com"
            ],
            color: "text-green-500"
        },
        {
            icon: MapPinIcon,
            title: "Visit Us",
            details: [
                "123 Payment Street",
                "Fintech Valley, CA 94107"
            ],
            color: "text-purple-500"
        },
        {
            icon: ClockIcon,
            title: "Business Hours",
            details: [
                "Mon - Fri: 9AM - 6PM",
                "Sat - Sun: 10AM - 4PM"
            ],
            color: "text-red-500"
        }
    ];

    // Add social media data
    const socialMedia = [
        {
            name: 'Facebook',
            icon: FaFacebook,
            link: 'https://facebook.com/cardstore',
            color: 'bg-blue-600',
            hoverColor: 'hover:bg-blue-700',
            updates: {
                followers: '50K+',
                latestPost: 'Check out our new virtual card features! 🚀'
            }
        },
        {
            name: 'Twitter',
            icon: FaTwitter,
            link: 'https://twitter.com/cardstore',
            color: 'bg-sky-500',
            hoverColor: 'hover:bg-sky-600',
            updates: {
                followers: '35K+',
                latestPost: "Exciting news! We've just launched in 5 new countries! 🌍"
            }
        },
        {
            name: 'Instagram',
            icon: FaInstagram,
            link: 'https://instagram.com/cardstore',
            color: 'bg-pink-600',
            hoverColor: 'hover:bg-pink-700',
            updates: {
                followers: '45K+',
                latestPost: 'Secure payments made simple ✨'
            }
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedin,
            link: 'https://linkedin.com/company/cardstore',
            color: 'bg-blue-700',
            hoverColor: 'hover:bg-blue-800',
            updates: {
                followers: '20K+',
                latestPost: 'CardStore announces new partnership with...'
            }
        }
    ];

    const directMessaging = [
        {
            name: 'WhatsApp',
            icon: FaWhatsapp,
            link: 'https://wa.me/1234567890',
            color: 'bg-green-500',
            hoverColor: 'hover:bg-green-600',
            status: 'Online',
            responseTime: '< 5 min'
        },
        {
            name: 'Messenger',
            icon: FaFacebookMessenger,
            link: 'https://m.me/cardstore',
            color: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-600',
            status: 'Online',
            responseTime: '< 10 min'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitStatus('success');
            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                department: 'general'
            });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus(null), 3000);
        }
    };

    return (
        <div className="flex-grow relative">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="gradient-bg absolute inset-0 opacity-10" />
                <BackgroundEffect />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-white py-20"
                >
                    <div className="container mx-auto px-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-5xl font-bold text-center mb-8"
                        >
                            Get in Touch
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-gray-300 text-center max-w-3xl mx-auto"
                        >
                            Have questions or need assistance? We're here to help you 24/7.
                        </motion.p>
                    </div>
                </motion.div>

                {/* Contact Information Grid */}
                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {contactInfo.map((info, index) => (
                                <motion.div
                                    key={info.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg"
                                >
                                    <div className={`${info.color} mb-4`}>
                                        <info.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{info.title}</h3>
                                    {info.details.map((detail, i) => (
                                        <p key={i} className="text-gray-600 dark:text-gray-300">
                                            {detail}
                                        </p>
                                    ))}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Social Media Section */}
                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Connect With Us</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {socialMedia.map((platform) => (
                                    <motion.a
                                        key={platform.name}
                                        href={platform.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        whileHover={{ scale: 1.05 }}
                                        className="block"
                                    >
                                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg hover:shadow-lg transition-all">
                                            <div className="flex items-center mb-4">
                                                <platform.icon className={`h-8 w-8 ${platform.color} text-white p-1.5 rounded-full`} />
                                                <span className="ml-3 font-semibold text-gray-900 dark:text-white">{platform.name}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                <p className="mb-2">{platform.updates.followers} followers</p>
                                                <p className="line-clamp-2">{platform.updates.latestPost}</p>
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Direct Messaging Section */}
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Quick Connect</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {directMessaging.map((platform) => (
                                    <motion.a
                                        key={platform.name}
                                        href={platform.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center justify-between ${platform.color} ${platform.hoverColor} text-white p-6 rounded-lg transition-colors`}
                                    >
                                        <div className="flex items-center">
                                            <platform.icon className="h-8 w-8" />
                                            <div className="ml-4">
                                                <h4 className="font-semibold">{platform.name}</h4>
                                                <p className="text-sm opacity-90">Response time: {platform.responseTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                            <span className="text-sm">{platform.status}</span>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid md:grid-cols-3 gap-12">
                                {/* Live Chat Section */}
                                <div className="md:col-span-1">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-lg">
                                        <ChatBubbleLeftRightIcon className="h-12 w-12 mb-6" />
                                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Live Chat</h3>
                                        <p className="mb-6">Get instant help from our support team</p>
                                        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                                            Start Chat
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Form */}
                                <div className="md:col-span-2">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                Department
                                            </label>
                                            <select
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                            >
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                required
                                                rows={6}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}
                                                    transition-colors`}
                                            >
                                                {isSubmitting ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </div>

                                        {submitStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`text-center p-4 rounded-lg ${
                                                    submitStatus === 'success' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {submitStatus === 'success' 
                                                    ? 'Message sent successfully!' 
                                                    : 'Failed to send message. Please try again.'}
                                            </motion.div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Preview Section */}
                <div className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Can't find what you're looking for? Check our comprehensive FAQ section
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            View FAQ
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact; 