import React, { Suspense, lazy } from 'react';
import SEO from './SEO';
import { getStructuredData } from '../utils/structuredData';
import LoadingSkeleton from './ui/LoadingSkeleton';
import StickyActions from './StickyActions';

// Lazy load components
const HeroSection = lazy(() => import('./home/HeroSection'));
const Features = lazy(() => import('./Features'));
const HowItWorks = lazy(() => import('./home/HowItWorks'));
const Stats = lazy(() => import('./home/Stats'));
const Pricing = lazy(() => import('./home/Pricing'));

function Home() {
    const structuredData = getStructuredData('home');

    return (
        <>
            <SEO 
                title="Virtual Services - Secure Virtual Cards"
                description="Get instant access to secure virtual cards for online payments. Supporting Visa, Mastercard with instant activation, global acceptance, and 24/7 support. Start using your virtual card today."
                type="website"
                path="/"
                image="/og-home.jpg" // Add an OpenGraph image for social sharing
            />
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
            
            <div className="relative md:pb-0 pb-32">
                <Suspense fallback={<LoadingSkeleton type="hero" />}>
                    <HeroSection />
                </Suspense>
                
                <Suspense fallback={<LoadingSkeleton type="features" />}>
                    <Features />
                </Suspense>
                
                <Suspense fallback={<LoadingSkeleton type="howItWorks" />}>
                    <HowItWorks />
                </Suspense>
                
                <Suspense fallback={<LoadingSkeleton type="pricing" />}>
                    <Pricing />
                </Suspense>
                
                <Suspense fallback={<LoadingSkeleton type="stats" />}>
                    <Stats />
                </Suspense>

                <StickyActions />
            </div>
        </>
    );
}

export default Home; 