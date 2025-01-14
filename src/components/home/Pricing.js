import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CARD_LOGOS = {
    visa: "/images/logos/visa-logo.png",
    mastercard: "/images/logos/mastercard-logo.png"
};

const PricingCard = ({ brand, price, features }) => (
    <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
        {/* Animated background gradient */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r 
            from-dark-text-primary/30 via-dark-text-secondary/20 to-dark-text-tertiary/30 
            dark:from-dark-text-primary/20 dark:via-dark-text-secondary/15 dark:to-dark-text-tertiary/20
            transform rotate-1 scale-102 blur-2xl transition-all duration-500 
            animate-gradient group-hover:rotate-2 group-hover:scale-105" />
        
        <div className="relative p-10 rounded-[2rem] transform transition-all duration-500
            bg-white/80 dark:bg-dark-bg-primary/80 backdrop-blur-xl 
            border border-white/20 dark:border-dark-text-primary/20 
            shadow-2xl hover:shadow-dark-text-primary/20
            dark:shadow-dark-text-primary/10">

            <div className="text-center">
                {/* Card Logo with Glow Effect */}
                <div className="relative inline-block mb-10 group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r 
                        from-dark-text-secondary to-dark-text-primary 
                        dark:from-dark-text-primary dark:to-dark-text-secondary
                        rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    <img 
                        src={CARD_LOGOS[brand.toLowerCase()]}
                        alt={`${brand} Card`}
                        className="relative h-20 mx-auto drop-shadow-xl"
                    />
                </div>

                {/* Card Title */}
                <h3 className="text-3xl font-bold bg-gradient-to-br 
                    from-gray-900 via-dark-text-primary to-gray-800
                    dark:from-white dark:via-dark-text-primary dark:to-dark-text-secondary
                    bg-clip-text text-transparent mb-6">
                    {brand} Virtual Card
                </h3>

                {/* Price Display */}
                <div className="mb-10">
                    <div className="flex items-center justify-center">
                        <span className="text-xl text-gray-500 dark:text-gray-400 mr-1">$</span>
                        <p className="text-6xl font-bold bg-gradient-to-br 
                            from-dark-text-primary to-dark-text-secondary
                            dark:from-dark-text-primary dark:to-dark-text-secondary
                            bg-clip-text text-transparent">{price}</p>
                        <span className="text-xl text-gray-500 dark:text-gray-400 ml-1">.00</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">one-time payment</p>
                </div>

                {/* Features List */}
                <ul className="text-left space-y-5 mb-10">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full 
                                bg-dark-text-primary/10 dark:bg-dark-text-primary/20 
                                flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-dark-text-primary dark:text-dark-text-secondary" 
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* Monthly Fee Notice */}
                <div className="mb-8 py-3 px-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-700/30">
                    <div className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            $0 Monthly Fee
                        </span>
                    </div>
                </div>

                {/* CTA Button */}
                <Link
                    to="/signup"
                    className="relative overflow-hidden block w-full py-4 px-8 rounded-2xl text-center font-semibold 
                        bg-gradient-to-br from-dark-text-primary via-dark-text-secondary to-dark-text-tertiary
                        dark:from-dark-text-primary dark:via-dark-text-secondary dark:to-dark-text-tertiary
                        text-white shadow-xl shadow-dark-text-primary/20 
                        hover:shadow-dark-text-primary/40 
                        transform transition-all duration-300 hover:scale-[1.02]
                        before:absolute before:inset-0 
                        before:bg-gradient-to-br 
                        before:from-dark-text-secondary
                        before:via-dark-text-primary 
                        before:to-dark-text-tertiary
                        before:opacity-0 before:transition-opacity 
                        before:duration-300 hover:before:opacity-100"
                >
                    <span className="relative z-10">Get Your Card Now</span>
                </Link>

                {/* Additional Fee Info */}
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Only ${price} one-time payment • No recurring fees
                </p>
            </div>
        </div>
    </div>
);

function Pricing() {
    const { t } = useTranslation();
    
    const pricingPlans = [
        {
            brand: 'Visa',
            price: 2,
            features: [
                t('home.pricing.features.noMonthlyFees'),
                t('home.pricing.features.instantCard'),
                t('home.pricing.features.worldwide'),
                t('home.pricing.features.notifications'),
                t('home.pricing.features.liability'),
                t('home.pricing.features.secure'),
                t('home.pricing.features.support')
            ]
        },
        {
            brand: 'Mastercard',
            price: 2,
            features: [
                'No Monthly Fees',
                'Instant Card Generation',
                'Enhanced Security',
                'Global Acceptance',
                'Real-time Alerts',
                'Purchase Protection',
                'Priority Support'
            ]
        }
    ];

    return (
        <section className="py-32 px-4 relative overflow-hidden" id="pricing">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 
                dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-primary" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] 
                from-dark-text-primary/10 via-transparent to-transparent
                dark:from-dark-text-primary/5" />
            <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-gray-100/[0.02] bg-[size:20px_20px]" />
            
            <div className="relative max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-5xl font-bold bg-gradient-to-r 
                        from-gray-900 via-dark-text-primary to-gray-900
                        dark:from-white dark:via-dark-text-primary dark:to-white
                        bg-clip-text text-transparent mb-6 leading-tight">
                        Choose Your Virtual Card
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Get instant access to secure virtual cards for your online payments
                        <span className="block mt-2 text-dark-text-primary dark:text-dark-text-secondary font-semibold">
                            One-time payment • No monthly fees • No hidden charges
                        </span>
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard key={index} {...plan} />
                    ))}
                </div>

                <div className="text-center mt-16">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        All cards include our premium security features and fraud protection
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Pricing; 