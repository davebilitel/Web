import React from 'react';
import { formatCurrency } from '../utils/currency';

function CardPreview({ card, onSelect }) {
    if (!card) {
        return (
            <div className="aspect-[1.586/1] rounded-xl shadow-lg bg-gray-200 animate-pulse">
                <div className="h-full flex items-center justify-center">
                    <span className="text-gray-400">Loading...</span>
                </div>
            </div>
        );
    }

    const cardStyles = {
        visa: {
            background: 'linear-gradient(45deg, #1a1f71, #0066b2)',
            logo: '/visa-logo.png'
        },
        mastercard: {
            background: 'linear-gradient(45deg, #ff5f00, #eb001b)',
            logo: '/mastercard-logo.png'
        }
    };

    const style = cardStyles[card.type.toLowerCase()] || cardStyles.visa;

    return (
        <div 
            className="relative group cursor-pointer"
            onClick={() => onSelect(card)}
        >
            <div 
                className="aspect-[1.586/1] rounded-xl shadow-lg overflow-hidden transform transition-transform group-hover:scale-105"
                style={{ background: style.background }}
            >
                {/* Card Content */}
                <div className="p-6 h-full flex flex-col justify-between text-white">
                    {/* Card Type and Chip */}
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12">
                            <img 
                                src={style.logo} 
                                alt={`${card.type} logo`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="w-10 h-10">
                            <img 
                                src="/chip.png" 
                                alt="Card chip"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Card Number Placeholder */}
                    <div className="text-lg tracking-wider">
                        •••• •••• •••• ••••
                    </div>

                    {/* Card Balance */}
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-sm opacity-80">Balance</div>
                            <div className="text-xl font-semibold">
                                {formatCurrency(card.balance)}
                            </div>
                        </div>
                        <div className="text-sm opacity-80">
                            VIRTUAL CARD
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
                <button 
                    className="bg-white text-blue-600 px-6 py-2 rounded-full font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                >
                    Select Card
                </button>
            </div>
        </div>
    );
}

export default CardPreview; 