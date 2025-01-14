import React, { useState } from 'react';
import { motion } from 'framer-motion';

function FlipCard({ type = 'MASTERCARD' }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const cardStyle = type.toUpperCase() === 'MASTERCARD' 
        ? 'bg-gradient-to-r from-orange-500 to-red-500'
        : 'bg-gradient-to-r from-blue-500 to-indigo-500';

    // Sample card numbers based on card type
    const sampleNumber = type.toUpperCase() === 'MASTERCARD' 
        ? '5412 75** **** 4321'
        : '4123 45** **** 5432';

    const frontContent = (
        <div className={`w-full h-full ${cardStyle} rounded-xl p-6 text-white relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute inset-0 opacity-30">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)"/>
                    </svg>
                </div>
            </div>

            <div className="relative z-10">
                <img 
                    src={`/images/${type.toLowerCase()}-logo.png`} 
                    alt={type} 
                    className="h-12 absolute top-0 right-0"
                />
                
                <div className="mt-12">
                    <div className="flex space-x-4">
                        <div className="w-12 h-8 bg-yellow-400 rounded"></div>
                        <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="text-xl tracking-widest font-mono">
                        {sampleNumber}
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-end">
                    <div>
                        <div className="text-xs opacity-75">VALID THRU</div>
                        <div className="font-mono">12/25</div>
                    </div>
                    <div 
                        onClick={() => setIsFlipped(true)}
                        className="text-sm cursor-pointer hover:underline"
                    >
                        View Sample CVV
                    </div>
                </div>
            </div>

            {/* Card shine effect */}
            <div className="card-shine"></div>
        </div>
    );

    const backContent = (
        <div className={`w-full h-full ${cardStyle} rounded-xl p-6 text-white relative overflow-hidden`}>
            <div className="absolute top-4 left-0 w-full h-12 bg-black"></div>
            <div className="absolute top-20 left-0 w-full px-6">
                <div className="w-full h-10 bg-white/20 rounded flex items-center justify-end pr-4">
                    <span className="font-mono">***</span>
                </div>
                <div className="mt-4 text-center text-sm">
                    <p>This is where your CVV will appear</p>
                    <button 
                        onClick={() => setIsFlipped(false)}
                        className="mt-2 text-white/80 hover:text-white underline"
                    >
                        Back to front
                    </button>
                </div>
            </div>

            {/* Card shine effect */}
            <div className="card-shine"></div>
        </div>
    );

    return (
        <div 
            className="relative w-[320px] h-[200px] cursor-pointer perspective-1000 mx-auto"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="w-full h-full transform-style-3d transition-transform duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px"
                }}
            >
                <div className="absolute w-full h-full backface-hidden" style={{ backfaceVisibility: "hidden" }}>
                    {frontContent}
                </div>
                <div 
                    className="absolute w-full h-full backface-hidden" 
                    style={{ 
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                    }}
                >
                    {backContent}
                </div>
            </motion.div>
        </div>
    );
}

export default FlipCard; 