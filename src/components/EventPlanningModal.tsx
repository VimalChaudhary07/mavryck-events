import React, { useState } from 'react';
import { X, Calendar, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createEventRequest } from '../lib/database';
import { sendEventNotification } from '../utils/email';

interface EventPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventPlanningModal({ isOpen, onClose }: EventPlanningModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_type: 'corporate',
    event_date: '',
    guest_count: '',
    requirements: '',
    status: 'pending' as const
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createEventRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        event_type: formData.event_type,
        event_date: formData.event_date,
        guest_count: formData.guest_count,
        requirements: formData.requirements,
        status: 'pending'
      });
      
      await sendEventNotification({
        customerEmail: formData.email,
        eventDetails: formData
      });

      toast.success('Event request submitted successfully!');
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        event_type: 'corporate',
        event_date: '',
        guest_count: '',
        requirements: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleDirectContact = (type: 'phone' | 'email') => {
    if (type === 'phone') {
      window.open('tel:+917045712235', '_self');
    } else {
      window.open('mailto:mavryckevents@gmail.com', '_self');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Calendar className="w-6 h-6 text-orange-500" />
                </motion.div>
                <h2 className="text-xl font-semibold text-white">Plan Your Event</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Direct Contact Options */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Need Immediate Assistance?</h3>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDirectContact('phone')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDirectContact('email')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Us
              </motion.button>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Or fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type
                </label>
                <select
                  id="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="corporate">Corporate Event</option>
                  <option value="wedding">Wedding Event</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="festival">Festival Event</option>
                  <option value="charity">Charity Event</option>
                  <option value="house-party">House Party</option>
                  <option value="reunion">Reunion Event</option>
                  <option value="anniversary">Anniversary Celebration</option>
                  <option value="promotional">Promotional Event</option>
                  <option value="gala">Gala Dinner</option>
                  <option value="other">Other</option>
                </select>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  id="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  id="guest_count"
                  value={formData.guest_count}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
                Special Requirements
              </label>
              <textarea
                id="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </motion.div>

            <div className="flex justify-end gap-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Request'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}