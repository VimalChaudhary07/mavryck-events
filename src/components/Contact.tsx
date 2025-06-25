import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { createContactMessage } from '../lib/database';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

export function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
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
      await createContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
        viewed: false
      });
      
      setSubmitStatus('success');
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Failed to send message:', error);
      setSubmitStatus('error');
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  return (
    <section id="contact" className="py-20 bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Touch</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Ready to plan your next event? We'd love to hear from you. Get in touch and let's create something amazing together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all"
                >
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Email</h4>
                    <a href="mailto:mr.gupta881@gmail.com" className="text-gray-400 hover:text-orange-500 transition-colors block">
                      mr.gupta881@gmail.com
                    </a>
                    <a href="mailto:mavryckevents@gmail.com" className="text-gray-400 hover:text-orange-500 transition-colors block">
                      mavryckevents@gmail.com
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all"
                >
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Phone</h4>
                    <a href="tel:+917045712235" className="text-gray-400 hover:text-orange-500 transition-colors text-lg">
                      +91 7045712235
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all"
                >
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Location</h4>
                    <p className="text-gray-400 leading-relaxed">
                      MAHALAXMI & CHINCHPOKLI, MUMBAI, MAHARASHTRA.<br />
                      PIN CODE - 400011.<br />
                      LANDMARK - MINARVA TOWER.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all"
                >
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <Instagram className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Social Media</h4>
                    <a 
                      href="https://www.instagram.com/mavryck_events" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      @mavryck_events
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20"
            >
              <h4 className="text-lg font-semibold text-white mb-4">Business Hours</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>By Appointment</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
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
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
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
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                    errors.message 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder="Tell us about your event or ask any questions..."
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                  submitStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : submitStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-orange-500/25'
                } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Message Sent!</span>
                  </>
                ) : submitStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-6 h-6" />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}