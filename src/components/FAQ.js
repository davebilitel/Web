import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FAQ() {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "What are Virtual Cards?",
            answer: "Virtual cards are digital payment cards that function like physical credit or debit cards but exist only in digital form. They provide secure online payment capabilities with unique card numbers, expiration dates, and CVV codes."
        },
        {
            question: "How secure are your Virtual Cards?",
            answer: "Our virtual cards are highly secure, featuring advanced encryption, dynamic CVV, and real-time transaction monitoring. Each card has unique details and can be instantly frozen or deleted if suspicious activity is detected."
        },
        {
            question: "Which payment methods do you accept?",
            answer: "We accept various payment methods including Mobile Money (MTN, Orange, Moov), Bank transfers, and other local payment options depending on your country. Supported countries include Cameroon, Senegal, Burkina Faso, Côte d'Ivoire, Rwanda, Uganda, and Kenya."
        },
        {
            question: "What are the fees for virtual cards?",
            answer: "Our virtual cards have a minimal service fee of $1 per card. The minimum initial load amount is $2. There are no hidden charges or monthly maintenance fees."
        },
        {
            question: "How quickly can I start using my virtual card?",
            answer: "Your virtual card is created instantly after successful payment. You can start using it immediately for online purchases and subscriptions."
        },
        {
            question: "In which countries can I use the virtual cards?",
            answer: "Our virtual cards can be used globally for online purchases where Visa or Mastercard is accepted. However, creation of cards is currently available in select African countries."
        },
        {
            question: "What happens if my payment fails?",
            answer: "If your payment fails, no charges will be made to your account. You can try again with the same or different payment method. If funds were deducted but the card wasn't created, you'll receive a refund within 24-48 hours."
        },
        {
            question: "Can I add funds to my virtual card later?",
            answer: "Currently, our virtual cards are non-reloadable. You'll need to create a new card if you need additional funds. This helps maintain maximum security for your online transactions."
        },
        {
            question: "How do I check my card balance?",
            answer: "You can view your card balance and transaction history through our secure dashboard. Each transaction is updated in real-time to help you track your spending."
        },
        {
            question: "What should I do if my virtual card is compromised?",
            answer: "If you suspect any unauthorized use of your virtual card, you should immediately: 1) Freeze the card through your dashboard, 2) Contact our support team, and 3) Report any unauthorized transactions."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                        <button
                            className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                            onClick={() => toggleAccordion(index)}
                        >
                            <span className="font-medium text-lg">{faq.question}</span>
                            <span className={`transform transition-transform duration-200 ${activeIndex === index ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        <AnimatePresence>
                            {activeIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t"
                                >
                                    <div className="px-6 py-4 bg-gray-50">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Contact Section */}
            <div className="mt-12 text-center">
                <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
                <p className="text-gray-600 mb-6">
                    Can't find the answer you're looking for? Please contact our support team.
                </p>
                <a
                    href="mailto:support@example.com"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Contact Support
                </a>
            </div>
        </div>
    );
}

export default FAQ; 