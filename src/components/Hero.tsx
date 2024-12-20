import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { EventPlanningModal } from './EventPlanningModal';

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80"
          className="w-full h-full object-cover"
          alt="Event Management"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col justify-center h-full pt-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Creating Memorable
            <span className="text-orange-500"> Events</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Your dedicated event planner to create memorable and engaging experiences for all. Making it fresh & grand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
            >
              Plan Your Event
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#services"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
            >
              Our Services
            </a>
          </div>
        </div>
      </div>

      <EventPlanningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}