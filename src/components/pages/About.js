import React from 'react';
import SEO from '../SEO';
import { getStructuredData } from '../../utils/structuredData';
import { motion } from 'framer-motion';
import { 
    CalendarIcon, 
    RocketLaunchIcon, 
    UserGroupIcon, 
    GlobeAltIcon, 
    ShieldCheckIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    UserIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import BackgroundEffect from '../BackgroundEffect';

function About() {
    const structuredData = getStructuredData('about');

    const milestones = [
        {
            year: '2020',
            title: 'Company Founded',
            description: 'Started with a vision to revolutionize virtual card payments',
            icon: CalendarIcon,
            position: 'left'
        },
        {
            year: '2021',
            title: 'Global Expansion',
            description: 'Expanded services to over 30 countries worldwide',
            icon: GlobeAltIcon,
            position: 'right'
        },
        {
            year: '2022',
            title: '1 Million Users',
            description: 'Reached our first million active users milestone',
            icon: UserGroupIcon,
            position: 'left'
        },
        {
            year: '2023',
            title: 'Enhanced Security',
            description: 'Implemented advanced fraud protection systems',
            icon: ShieldCheckIcon,
            position: 'right'
        },
        {
            year: '2024',
            title: 'Virtual Cards Made Simple',
            description: 'Get instant access to premium virtual cards for all your digital payments',
            icon: RocketLaunchIcon,
            position: 'left'
        }
    ];

    const stats = [
        {
            number: "1M+",
            label: "Active Users",
            icon: UserIcon,
            color: "text-blue-500"
        },
        {
            number: "$500M+",
            label: "Transactions Processed",
            icon: CurrencyDollarIcon,
            color: "text-green-500"
        },
        {
            number: "30+",
            label: "Countries Served",
            icon: GlobeAltIcon,
            color: "text-purple-500"
        },
        {
            number: "99.9%",
            label: "Uptime",
            icon: ChartBarIcon,
            color: "text-red-500"
        }
    ];

    const team = [
        {
            name: "John Smith",
            role: "CEO & Founder",
            image: "/images/team/john.jpg",
            bio: "20+ years in fintech"
        },
        {
            name: "Sarah Johnson",
            role: "CTO",
            image: "/images/team/sarah.jpg",
            bio: "Former Google engineer"
        },
        {
            name: "Michael Chen",
            role: "Head of Security",
            image: "/images/team/michael.jpg",
            bio: "Cybersecurity expert"
        }
    ];

    const values = [
        {
            title: "Innovation",
            description: "Pushing boundaries in virtual payment solutions",
            icon: RocketLaunchIcon,
            color: "bg-blue-500"
        },
        {
            title: "Security",
            description: "Uncompromising protection of customer data",
            icon: ShieldCheckIcon,
            color: "bg-green-500"
        },
        {
            title: "Reliability",
            description: "Consistent and dependable service",
            icon: BuildingOfficeIcon,
            color: "bg-purple-500"
        }
    ];

    return (
        <>
            <SEO 
                title="About Us"
                description="Learn about Virtual Services, your trusted provider of secure virtual cards for online payments. Discover our journey, mission, and commitment to secure digital transactions."
                type="website"
                path="/about"
            />
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
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
                                className="text-4xl md:text-5xl font-bold text-center mb-8 text-white"
                            >
                                About Us
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl text-gray-300 text-center max-w-3xl mx-auto"
                            >
                                We're dedicated to providing secure and convenient virtual card solutions
                                for your online payment needs.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Stats Section */}
                    <div className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <div className="container mx-auto px-4">
                            <div className="grid md:grid-cols-4 gap-8">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="text-center"
                                    >
                                        <div className={`${stat.color} mb-4 flex justify-center`}>
                                            <stat.icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                                            {stat.number}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="py-20">
                        <div className="container mx-auto px-4">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white"
                            >
                                Our Core Values
                            </motion.h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {values.map((value, index) => (
                                    <motion.div
                                        key={value.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-lg text-center"
                                    >
                                        <div className={`${value.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6`}>
                                            <value.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {value.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mission Section */}
                    <div className="py-20">
                        <div className="container mx-auto px-4">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <motion.div
                                    initial={{ x: -50, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-lg"
                                >
                                    <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        To provide secure, reliable, and instant virtual card solutions that
                                        empower people to make online transactions with confidence.
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        We believe in making global online payments accessible to everyone
                                        through innovative virtual card solutions.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-8"
                                >
                                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose Us?</h3>
                                    <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                                        <li className="flex items-center">
                                            <svg
                                                className="h-6 w-6 text-green-500 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            Instant Card Delivery
                                        </li>
                                        <li className="flex items-center">
                                            <svg
                                                className="h-6 w-6 text-green-500 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            Secure Transactions
                                        </li>
                                        <li className="flex items-center">
                                            <svg
                                                className="h-6 w-6 text-green-500 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            24/7 Customer Support
                                        </li>
                                    </ul>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <div className="container mx-auto px-4">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white"
                            >
                                Leadership Team
                            </motion.h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {team.map((member, index) => (
                                    <motion.div
                                        key={member.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="text-center"
                                    >
                                        <div className="mb-6">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-32 h-32 rounded-full mx-auto object-cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                            {member.name}
                                        </h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                                            {member.role}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {member.bio}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Journey Section */}
                    <div className="py-20">
                        <div className="container mx-auto px-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white"
                            >
                                Our Journey
                            </motion.h2>

                            <div className="relative">
                                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

                                <div className="space-y-20">
                                    {milestones.map((milestone, index) => (
                                        <motion.div
                                            key={milestone.year}
                                            initial={{ opacity: 0, x: milestone.position === 'left' ? -50 : 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.2 }}
                                            className={`flex items-center ${
                                                milestone.position === 'left' ? 'flex-row' : 'flex-row-reverse'
                                            } relative`}
                                        >
                                            <div className={`w-5/12 ${milestone.position === 'left' ? 'text-right pr-8' : 'text-left pl-8'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg`}>
                                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{milestone.title}</h3>
                                                <span className="text-blue-600 dark:text-blue-400 font-semibold">{milestone.year}</span>
                                                <p className="text-gray-600 dark:text-gray-300 mt-2">{milestone.description}</p>
                                            </div>

                                            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white">
                                                <milestone.icon className="w-6 h-6" />
                                            </div>

                                            <div className="w-5/12" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default About; 