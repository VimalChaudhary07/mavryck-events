import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function RefundPolicy() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
          <div className="prose prose-invert">
            <p className="text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Deposit Refunds</h2>
              <p className="text-gray-300">
                Event deposits are non-refundable but may be transferable to another date within
                6 months, subject to availability and management approval.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Cancellation Timeline</h2>
              <ul className="list-disc list-inside text-gray-300 mt-2">
                <li>90+ days before event: 75% refund of paid amount (excluding deposit)</li>
                <li>60-89 days before event: 50% refund of paid amount (excluding deposit)</li>
                <li>30-59 days before event: 25% refund of paid amount (excluding deposit)</li>
                <li>Less than 30 days before event: No refund</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Force Majeure</h2>
              <p className="text-gray-300">
                In cases of force majeure (natural disasters, pandemics, etc.), we will work with
                clients to reschedule events without additional fees.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Service Adjustments</h2>
              <p className="text-gray-300">
                If we fail to provide contracted services, appropriate refunds will be issued based
                on the specific circumstances and services affected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Refund Process</h2>
              <p className="text-gray-300">
                Approved refunds will be processed within 14 business days using the original
                payment method when possible.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}