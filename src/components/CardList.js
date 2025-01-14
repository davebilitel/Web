import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardPreview from './CardPreview';
import { formatCurrency } from '../utils/currency';

function CardList() {
    const navigate = useNavigate();
    const cardFee = 1; // $1 fee

    const cards = [
        {
            id: 'visa',
            type: 'VISA',
            balance: 25, // USD
            image: '/visa-logo.png'
        },
        {
            id: 'mastercard',
            type: 'MASTERCARD',
            balance: 50, // USD
            image: '/mastercard-logo.png'
        }
    ];

    const handleCardSelect = (card) => {
        navigate('/checkout', {
            state: {
                cardType: card.type,
                balanceUSD: card.balance,
                feeUSD: cardFee,
                amount: null,
                cardBalance: null
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">Choose Your Virtual Card</h1>
                    <p className="mt-2 text-gray-600">Select a card type to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {cards.map((card) => (
                        <CardPreview
                            key={card.id}
                            card={card}
                            onSelect={() => handleCardSelect(card)}
                        />
                    ))}
                </div>

                <div className="text-center mt-8 text-sm text-gray-600">
                    <p>Service fee: {formatCurrency(cardFee)}</p>
                </div>
            </div>
        </div>
    );
}

export default CardList; 