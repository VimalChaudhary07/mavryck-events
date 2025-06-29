import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SecurityMiddleware } from './components/SecurityMiddleware';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Testimonials } from './components/Testimonials';
import { GalleryAndProducts } from './components/GalleryAndProducts';
import Contact from './components/Contact';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';
import { RefundPolicy } from './components/RefundPolicy';
import SEOHead from './components/SEOHead';

function App() {
  return (
    <Router>
      <SecurityMiddleware>
        <div className="min-h-screen bg-gray-900">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff'
                }
              }
            }}
          />
          <Routes>
            <Route path="/admin" element={
              <>
                <SEOHead 
                  title="Admin Login - Mavryck Events"
                  description="Admin login portal for Mavryck Events management system"
                  noindex={true}
                />
                <AdminLogin />
              </>
            } />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <SEOHead 
                    title="Admin Dashboard - Mavryck Events"
                    description="Admin dashboard for managing Mavryck Events"
                    noindex={true}
                  />
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy" element={
              <>
                <SEOHead 
                  title="Privacy Policy - Mavryck Events"
                  description="Privacy policy for Mavryck Events - how we collect, use, and protect your personal information"
                  url="https://mavryckevents.com/privacy"
                />
                <PrivacyPolicy />
              </>
            } />
            <Route path="/terms" element={
              <>
                <SEOHead 
                  title="Terms and Conditions - Mavryck Events"
                  description="Terms and conditions for Mavryck Events services - booking policies, payments, and service agreements"
                  url="https://mavryckevents.com/terms"
                />
                <TermsConditions />
              </>
            } />
            <Route path="/refund" element={
              <>
                <SEOHead 
                  title="Refund Policy - Mavryck Events"
                  description="Refund and cancellation policy for Mavryck Events - understand our refund terms and conditions"
                  url="https://mavryckevents.com/refund"
                />
                <RefundPolicy />
              </>
            } />
            <Route
              path="/"
              element={
                <>
                  <SEOHead />
                  <Navbar />
                  <Hero />
                  <Services />
                  <GalleryAndProducts />
                  <Testimonials />
                  <Contact />
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </SecurityMiddleware>
    </Router>
  );
}

export default App;