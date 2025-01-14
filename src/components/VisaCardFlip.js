import React from 'react';
import LazyImage from './ui/LazyImage';

function VisaCardFlip({ balance, isFlipped, onFlip }) {
    return (
        <div className="w-full max-w-2xl cursor-pointer" onClick={onFlip}>
            <div className="aspect-[1.586/1] relative preserve-3d" 
                style={{ 
                    perspective: "1000px",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s"
                }}>
                {/* Front of card */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg overflow-hidden backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}>
                    <div className="p-8 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                            <LazyImage 
                                src="/images/logos/visa-white.png" 
                                alt="Visa" 
                                className="h-14"
                                width={56}
                                height={56}
                            />
                            <LazyImage 
                                src="/images/cards/chip.png" 
                                alt="Chip" 
                                className="h-12 chip-animation"
                                width={48}
                                height={48}
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="text-2xl tracking-wider">
                                •••• •••• •••• ••••
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-base opacity-80">Balance</div>
                                    <div className="text-2xl font-semibold">
                                        {balance}
                                    </div>
                                </div>
                                <div className="text-base opacity-80">
                                    VIRTUAL CARD
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Visa hologram effect */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
                            animation: "pulse 2s infinite"
                        }}
                    />
                </div>

                {/* Back of card */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg overflow-hidden backface-hidden"
                    style={{ 
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                    }}>
                    <div className="h-full flex flex-col">
                        <div className="magnetic-stripe h-16 mt-8 w-full"></div>
                        <div className="p-8 flex-1 flex flex-col justify-center">
                            <div className="bg-white h-12 flex items-center px-4">
                                <div className="text-gray-800 tracking-wider">
                                    CVV: <span className="font-mono">***</span>
                                </div>
                            </div>
                            <div className="mt-4 text-white text-sm opacity-80 text-center">
                                Click to flip card
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisaCardFlip; 