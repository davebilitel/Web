export const getStructuredData = (page, data = {}) => {
    const baseData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Virtual Services",
        "url": "https://virtualservicesaf.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://virtualservicesaf.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const structuredData = {
        home: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Virtual Services",
            "url": "https://virtualservicesaf.com",
            "logo": "https://virtualservicesaf.com/logo.png",
            "sameAs": [
                "https://twitter.com/virtualservices",
                "https://facebook.com/virtualservices"
            ],
            "description": "Virtual Services provides secure virtual cards for online payments, supporting both Visa and Mastercard with instant activation and global acceptance.",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "CM"
            },
            "contactPoint": [{
                "@type": "ContactPoint",
                "telephone": "+237-000-0000",
                "contactType": "customer service",
                "availableLanguage": ["English", "French"],
                "areaServed": ["CM", "SN", "BF", "CI", "RW", "UG", "KE"]
            }],
            "offers": {
                "@type": "AggregateOffer",
                "offerCount": "2",
                "lowPrice": "1",
                "highPrice": "1000",
                "priceCurrency": "USD",
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "Visa Virtual Card",
                        "price": "1",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    },
                    {
                        "@type": "Offer",
                        "name": "Mastercard Virtual Card",
                        "price": "1",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    }
                ]
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://virtualservicesaf.com",
                "name": "Virtual Services - Secure Virtual Cards",
                "description": "Get instant access to secure virtual cards for online payments. Supporting Visa, Mastercard with instant activation and global acceptance.",
                "primaryImageOfPage": {
                    "@type": "ImageObject",
                    "url": "https://virtualservicesaf.com/og-home.jpg"
                },
                "speakable": {
                    "@type": "SpeakableSpecification",
                    "cssSelector": [".hero-title", ".hero-description"]
                }
            }
        },
        product: {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": data.cardType + " Virtual Card",
            "description": `Secure ${data.cardType} virtual card for online payments`,
            "brand": {
                "@type": "Brand",
                "name": data.cardType
            },
            "offers": {
                "@type": "Offer",
                "price": data.price,
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
            }
        },
        about: {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Virtual Services",
            "description": "Learn about our secure virtual card services and company history"
        },
        faq: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "How quickly can I use my virtual card?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Your virtual card is available instantly after purchase."
                    }
                }
                // Add more FAQ items
            ]
        },
        contact: {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Virtual Services",
            "description": "Contact our support team for assistance with virtual cards",
            "url": "https://virtualservicesaf.com/contact",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-234-567-8900",
                "contactType": "customer service",
                "availableLanguage": ["English", "French"]
            }
        }
    };

    return structuredData[page] || baseData;
}; 