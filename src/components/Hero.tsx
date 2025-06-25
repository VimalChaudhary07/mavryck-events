import React, { useState } from 'react';
import { ArrowRight, Calendar, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { EventPlanningModal } from './EventPlanningModal';

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with parallax effect */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
      >
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80"
          className="w-full h-full object-cover"
          alt="Event Management"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </motion.div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex flex-col justify-center min-h-screen pt-20 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Creating Memorable
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500"> Events</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
              Your dedicated event planner to create memorable and engaging experiences for all. 
              Making it fresh & grand with professional expertise and creative vision.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12"
          >
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold flex items-center justify-center gap-3 transition-all duration-300 text-base sm:text-lg shadow-lg"
            >
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              Plan Your Event
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            <motion.button
              onClick={() => scrollToSection('services')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 text-base sm:text-lg backdrop-blur-sm"
            >
              Our Services
            </motion.button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">500+</div>
                  <div className="text-gray-300 text-sm">Events Planned</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">1000+</div>
                  <div className="text-gray-300 text-sm">Happy Clients</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">50+</div>
                  <div className="text-gray-300 text-sm">Venues</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/70 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>

      <EventPlanningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}