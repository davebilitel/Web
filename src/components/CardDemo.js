import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function CardDemo() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const cardVariants = {
        front: {
            rotateY: 0,
            transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
        },
        back: {
            rotateY: 180,
            transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
        }
    };

    const glowVariants = {
        idle: {
            opacity: 0.15,
            scale: 1
        },
        hover: {
            opacity: 0.3,
            scale: 1.1,
            transition: {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
            }
        }
    };

    return (
        <div className="relative w-full min-h-[400px] flex items-center justify-center py-8">
            {/* Background glow effect */}
            <motion.div
                className="absolute inset-0 -top-20 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-3xl"
                variants={glowVariants}
                initial="idle"
                animate={isHovered ? "hover" : "idle"}
            />

            {/* Card Container */}
            <div className="relative z-10">
                <motion.div
                    className="w-[380px] h-[220px] cursor-pointer"
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: "2000px" }}
                >
                    <motion.div
                        className="w-full h-full relative"
                        animate={isFlipped ? "back" : "front"}
                        variants={cardVariants}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {/* Front of card */}
                        <motion.div
                            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-6
                                bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                                shadow-[0_8px_16px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden"
                            style={{
                                backgroundImage: `
                                    radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                    linear-gradient(to right, rgba(255,255,255,0.1), transparent)
                                `
                            }}
                        >
                            {/* Add decorative elements */}
                            <div className="absolute inset-0 opacity-50">
                                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full 
                                    bg-gradient-to-br from-blue-400 to-blue-600 blur-2xl" />
                                <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full 
                                    bg-gradient-to-br from-purple-400 to-pink-600 blur-2xl" />
                            </div>

                            {/* Card content with improved contrast */}
                            <div className="relative">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="text-white/90 text-sm font-medium 
                                            backdrop-blur-sm px-2 py-1 rounded-lg bg-white/10">
                                            Virtual Card
                                        </div>
                                        <div className="text-white text-2xl font-bold 
                                            drop-shadow-lg">
                                            $2,500.00
                                        </div>
                                    </div>
                                    <CreditCardIcon className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex justify-between items-center">
                                        <div className="text-white tracking-wider font-medium
                                            drop-shadow-lg">
                                            •••• •••• •••• 4582
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-xs 
                                            bg-gradient-to-r from-green-400/30 to-green-300/30 
                                            text-white border border-green-300/30 backdrop-blur-sm">
                                            Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced shimmer effect */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-30"
                                style={{
                                    background: `
                                        linear-gradient(
                                            90deg, 
                                            transparent, 
                                            rgba(255,255,255,0.3), 
                                            transparent
                                        )
                                    `,
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 3s infinite linear'
                                }}
                            />
                        </motion.div>

                        {/* Back of card */}
                        <motion.div
                            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-6
                                bg-gradient-to-br from-gray-800 to-gray-900
                                shadow-[0_8px_16px_rgba(0,0,0,0.3)] border border-white/20"
                            style={{ transform: 'rotateY(180deg)' }}
                        >
                            {/* Magnetic stripe */}
                            <div className="w-full h-12 bg-black mt-4" />
                            
                            {/* CVV area */}
                            <div className="mt-8">
                                <div className="bg-white/10 h-10 rounded flex items-center px-4 justify-between">
                                    <div className="text-white/60 text-sm">CVV</div>
                                    <LockClosedIcon className="w-4 h-4 text-white/60" />
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 text-white/60 text-xs text-center">
                                This card is protected by advanced security features
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Instruction text */}
                <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                    Click card to flip
                </div>
            </div>
        </div>
    );
}

export default CardDemo; 