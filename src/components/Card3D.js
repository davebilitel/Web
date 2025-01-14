import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const Card3D = ({ cardDetails }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const getBrandStyles = () => {
        switch (cardDetails.type) {
            case 'VISA':
                return {
                    gradient: 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400',
                    pattern: 'radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 80%)',
                    logo: '/visa-logo.png'
                };
            case 'MASTERCARD':
                return {
                    gradient: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500',
                    pattern: 'radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 80%)',
                    logo: '/mastercard-logo.png'
                };
            default:
                return {
                    gradient: 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500',
                    pattern: 'radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 80%)',
                    logo: null
                };
        }
    };

    const { gradient, pattern, logo } = getBrandStyles();

    return (
        <div className="perspective-1000 w-full max-w-md">
            <motion.div
                className="relative w-full h-56 cursor-pointer preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Front of card */}
                <div className={`absolute w-full h-full rounded-2xl ${gradient} shadow-2xl backface-hidden`}>
                    <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: pattern }}
                    />
                    <div className="relative p-6 flex flex-col justify-between h-full text-white">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-10 bg-yellow-300/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <div className="w-8 h-6 bg-yellow-400/90 rounded" />
                            </div>
                            {logo ? (
                                <img src={logo} alt={cardDetails.type} className="h-8" />
                            ) : (
                                <CreditCardIcon className="h-8 w-8" />
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="font-mono text-xl tracking-wider">
                                {cardDetails.cardNumber}
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs text-white/70">Card Holder</div>
                                    <div className="font-medium truncate">{cardDetails.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/70">Type</div>
                                    <div className="font-medium">{cardDetails.type}</div>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(!isFlipped);
                            }}
                        >
                            <ArrowPathIcon className="h-5 w-5 text-white" />
                        </motion.button>
                    </div>
                </div>

                {/* Back of card */}
                <div className={`absolute w-full h-full rounded-2xl ${gradient} shadow-2xl backface-hidden rotate-y-180`}>
                    <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: pattern }}
                    />
                    <div className="relative p-6 flex flex-col justify-between h-full text-white">
                        <div className="w-full h-12 bg-black/30 backdrop-blur-sm mt-4" />
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-white/70">Status</div>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    cardDetails.status === 'ACTIVE' 
                                        ? 'bg-green-500/20 text-green-100'
                                        : 'bg-red-500/20 text-red-100'
                                }`}>
                                    {cardDetails.status}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-white/70">Card ID</div>
                                <div className="font-mono">{cardDetails.cardId}</div>
                            </div>
                        </div>

                        <motion.button
                            className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(!isFlipped);
                            }}
                        >
                            <ArrowPathIcon className="h-5 w-5 text-white" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Card3D; 