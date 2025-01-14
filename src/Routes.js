import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import VisaCard from './components/VisaCard';
import MasterCard from './components/MasterCard';
import Checkout from './components/Checkout';
import Success from './components/Success';
import Login from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FAQ from './components/FAQ';
import Balance from './components/Balance';
import TopUp from './components/TopUp';
import TopUpCheckout from './components/TopUpCheckout';
import TopUpSuccess from './components/TopUpSuccess';
import TopUpFailed from './components/TopUpFailed';
import Pay from './components/Pay';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailed from './components/PaymentFailed';
import StickyActions from './components/StickyActions';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Codes from './components/Codes';

// Lazy load AMP components
const HomeAMP = lazy(() => import('./components/amp/HomeAMP'));
const VisaCardAMP = lazy(() => import('./components/amp/VisaCardAMP'));
const MasterCardAMP = lazy(() => import('./components/amp/MasterCardAMP'));

function AppRoutes() {
    return (
        <div className="min-h-screen bg-white dark:bg-dark-bg-primary transition-colors duration-200">
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow pt-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/visa" element={<VisaCard />} />
                        <Route path="/mastercard" element={<MasterCard />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/success" element={<Success />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/admin/login" element={<Login />} />
                        <Route 
                            path="/admin/dashboard/*" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/balance" element={<Balance />} />
                        <Route path="/top-up" element={<TopUp />} />
                        <Route path="/top-up-checkout" element={<TopUpCheckout />} />
                        <Route path="/top-up-success" element={<TopUpSuccess />} />
                        <Route path="/top-up-failed" element={<TopUpFailed />} />
                        <Route path="/pay" element={<Pay />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/payment-failed" element={<PaymentFailed />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/codes" element={<Codes />} />
                        <Route 
                            path="/amp" 
                            element={
                                <Suspense fallback={<div>Loading...</div>}>
                                    <HomeAMP />
                                </Suspense>
                            } 
                        />
                        <Route 
                            path="/visa/amp" 
                            element={
                                <Suspense fallback={<div>Loading...</div>}>
                                    <VisaCardAMP />
                                </Suspense>
                            } 
                        />
                        <Route 
                            path="/mastercard/amp" 
                            element={
                                <Suspense fallback={<div>Loading...</div>}>
                                    <MasterCardAMP />
                                </Suspense>
                            } 
                        />
                    </Routes>
                </main>
                <Footer />
                <StickyActions />
            </div>
        </div>
    );
}

export default AppRoutes; 