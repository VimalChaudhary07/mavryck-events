import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function TermsConditions() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">Terms and Conditions</h1>
          <div className="prose prose-invert">
            <p className="text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing and using our services, you agree to be bound by these Terms and Conditions
                and our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Services</h2>
              <p className="text-gray-300">
                We provide event planning and management services. The specific details, including pricing
                and deliverables, will be outlined in individual service agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Booking and Payments</h2>
              <ul className="list-disc list-inside text-gray-300 mt-2">
                <li>A deposit is required to secure your event date</li>
                <li>Final payment is due 14 days before the event</li>
                <li>All payments are non-refundable unless otherwise specified</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Cancellation Policy</h2>
              <p className="text-gray-300">
                Cancellations must be made in writing. Refunds are subject to our cancellation policy,
                which varies based on the timing of the cancellation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Liability</h2>
              <p className="text-gray-300">
                While we strive for perfection, we cannot be held liable for circumstances beyond our
                control. We recommend event insurance for additional protection.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}