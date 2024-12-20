import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <div className="prose prose-invert">
            <p className="text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-300">
                We collect information that you provide directly to us, including names, email addresses,
                phone numbers, and other details necessary for event planning and management.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-300">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Communicate with you about events and services</li>
                <li>Process payments and send billing information</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <p className="text-gray-300">
                We do not sell or rent your personal information to third parties. We may share your
                information with trusted service providers who assist us in operating our business.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Security</h2>
              <p className="text-gray-300">
                We implement appropriate security measures to protect your personal information from
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@festive.finesse.events
                <br />
                Phone: +91 1234567890
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}