import React, { useState } from 'react';
import { X, Calendar, Phone, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createEventRequest } from '../lib/database';

interface EventPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  guest_count: string;
  requirements: string;
}

interface FormErrors {
  [key: string]: string;
}

export function EventPlanningModal({ isOpen, onClose }: EventPlanningModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    event_type: 'corporate',
    event_date: '',
    guest_count: '',
    requirements: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Event date validation
    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.event_date = 'Event date cannot be in the past';
      }
    }

    // Guest count validation
    if (!formData.guest_count.trim()) {
      newErrors.guest_count = 'Number of guests is required';
    } else if (parseInt(formData.guest_count) < 1) {
      newErrors.guest_count = 'Must have at least 1 guest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await createEventRequest({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        event_type: formData.event_type,
        event_date: formData.event_date,
        guest_count: formData.guest_count,
        requirements: formData.requirements.trim(),
        status: 'pending'
      });
      
      setSubmitStatus('success');
      toast.success('Event request submitted successfully! We\'ll contact you within 24 hours.');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          event_type: 'corporate',
          event_date: '',
          guest_count: '',
          requirements: ''
        });
        setErrors({});
        setSubmitStatus('idle');
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleDirectContact = (type: 'phone' | 'email') => {
    if (type === 'phone') {
      window.open('tel:+917045712235', '_self');
    } else {
      window.open('mailto:mavryckevents@gmail.com', '_self');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setErrors({});
      setSubmitStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-orange-500/10 to-red-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 bg-orange-500/20 rounded-full"
                >
                  <Calendar className="w-6 h-6 text-orange-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Plan Your Event</h2>
                  <p className="text-gray-400">Let's create something amazing together</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-full disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Direct Contact Options */}
          <div className="p-6 border-b border-gray-700 bg-gray-700/30">
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
            <p className="text-gray-400 text-sm mt-3">
              Or fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </motion.div>

              {/* Email Field */}
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </motion.div>

              {/* Phone Field */}
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder="+91 1234567890"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </motion.div>

              {/* Event Type Field */}
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type *
                </label>
                <select
                  id="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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

              {/* Event Date Field */}
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.event_date 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                />
                {errors.event_date && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.event_date}
                  </p>
                )}
              </motion.div>

              {/* Guest Count Field */}
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  id="guest_count"
                  value={formData.guest_count}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.guest_count 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder="e.g., 50"
                />
                {errors.guest_count && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.guest_count}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Requirements Field */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
                Special Requirements
              </label>
              <textarea
                id="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tell us about any special requirements, themes, or preferences for your event..."
              />
            </motion.div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <motion.button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  submitStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : submitStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submitted!</span>
                  </>
                ) : submitStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Submit Request</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}