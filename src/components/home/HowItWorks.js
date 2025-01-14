import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function HowItWorks() {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = React.useState(0);

    React.useEffect(() => {
        const carousel = document.querySelector('.snap-x');
        if (!carousel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const slideIndex = Array.from(carousel.children).indexOf(entry.target);
                        setCurrentSlide(slideIndex);
                    }
                });
            },
            {
                root: carousel,
                threshold: 0.5,
                rootMargin: '0px'
            }
        );

        Array.from(carousel.children).forEach(slide => observer.observe(slide));

        return () => observer.disconnect();
    }, []);

    const steps = [
        {
            title: t('home.howItWorks.steps.choose.title'),
            description: t('home.howItWorks.steps.choose.description'),
            icon: "🎯",
            color: "from-blue-400 to-blue-600"
        },
        {
            title: t('home.howItWorks.steps.payment.title'),
            description: t('home.howItWorks.steps.payment.description'),
            icon: "💳",
            color: "from-purple-400 to-purple-600"
        },
        {
            title: t('home.howItWorks.steps.getCard.title'),
            description: t('home.howItWorks.steps.getCard.description'),
            icon: "✨",
            color: "from-green-400 to-green-600"
        },
        {
            title: t('home.howItWorks.steps.start.title'),
            description: t('home.howItWorks.steps.start.description'),
            icon: "🚀",
            color: "from-pink-400 to-pink-600"
        }
    ];

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.8,
                ease: "easeOut"
            } 
        }
    };

    return (
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg-primary dark:to-dark-bg-secondary py-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-blue-400 mb-6">
                        How It Works
                    </h2>
                    <p className="text-gray-600 dark:text-blue-300 text-xl">
                        Get your virtual card in 4 simple steps
                    </p>
                </motion.div>

                <motion.div
                    className="max-w-7xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`relative flex items-center gap-8 mb-12 ${
                                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                            } hidden lg:flex`}
                        >
                            {/* Content Side */}
                            <div className="w-1/2 flex justify-center">
                                <div className="bg-white dark:bg-dark-bg-tertiary rounded-2xl p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl w-full max-w-lg">
                                    {/* Step number indicator */}
                                    <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                        {index + 1}
                                    </div>
                                    
                                    {/* Icon container */}
                                    <div className="mb-6">
                                        <span className="text-4xl">{step.icon}</span>
                                    </div>
                                    
                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-blue-400 mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-blue-300 text-lg">
                                        {step.description}
                                    </p>
                                    
                                    {/* Connecting line */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-1/2 left-full w-8 h-0.5">
                                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-transparent animate-pulse" />
                                            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Image/Icon Side */}
                            <div className="w-1/2 flex justify-center">
                                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                                    <span className="text-6xl">{step.icon}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    {/* Mobile Carousel View */}
                    <div className="lg:hidden relative">
                        <motion.div
                            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {steps.map((step, index) => (
                                <div 
                                    key={index}
                                    className="min-w-full snap-center px-4"
                                >
                                    <div className="bg-white dark:bg-dark-bg-tertiary rounded-2xl p-6 transform transition-all duration-300 hover:shadow-xl">
                                        {/* Step number indicator */}
                                        <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                            {index + 1}
                                        </div>
                                        
                                        {/* Icon container */}
                                        <div className="mb-6">
                                            <span className="text-4xl">{step.icon}</span>
                                        </div>
                                        
                                        {/* Content */}
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-blue-400 mb-4">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-blue-300 text-lg">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                        
                        {/* Carousel Navigation Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {steps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        const carousel = document.querySelector('.snap-x');
                                        carousel.scrollLeft = index * carousel.offsetWidth;
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        currentSlide === index 
                                            ? 'bg-blue-500 w-4' 
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default HowItWorks; 