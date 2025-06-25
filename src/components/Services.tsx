import React from 'react';
import { Calendar, Gift, Heart, Building2, Music, Star, Award, PartyPopper, MapPin, Paintbrush, HeartHandshake, Home, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    id: 1,
    icon: Calendar,
    name: 'Event Planning',
    description: 'Full-scale event planning and management services including venue selection, scheduling, and coordination.'
  },
  {
    id: 2,
    icon: MapPin,
    name: 'Venue Selection',
    description: 'Expert assistance in choosing the perfect venue that aligns with your event theme, size, and requirements.'
  },
  {
    id: 3,
    icon: Paintbrush,
    name: 'Design And Decor',
    description: 'Creative design and decor services to transform spaces according to your event theme and vision.'
  },
  {
    id: 4,
    icon: Heart,
    name: 'Wedding Events',
    description: 'Comprehensive wedding planning and coordination, creating magical moments for your special day.'
  },
  {
    id: 5,
    icon: Building2,
    name: 'Corporate Events',
    description: 'Professional corporate event management for conferences, seminars, and team buildings.'
  },
  {
    id: 6,
    icon: HeartHandshake,
    name: 'Charity Events',
    description: 'Comprehensive planning for fundraisers and charitable events, maximizing impact and support for noble causes.'
  },
  {
    id: 7,
    icon: Home,
    name: 'House Parties',
    description: 'Personalized planning for private house parties, ensuring seamless experiences without the stress of organizing.'
  },
  {
    id: 8,
    icon: Users,
    name: 'Reunions Events',
    description: 'Tailored coordination for family, school, or alumni reunions, fostering connections and creating memories.'
  },
  {
    id: 9,
    icon: Gift,
    name: 'Birthday Events',
    description: 'Customized birthday celebrations with unique themes, entertainment, and memorable experiences.'
  },
  {
    id: 10,
    icon: Music,
    name: 'Festival Events',
    description: 'Large-scale festival organization for cultural and entertainment events.'
  },
  {
    id: 11,
    icon: Star,
    name: 'Anniversary Events',
    description: 'Special anniversary celebrations with personalized touches and memorable moments.'
  },
  {
    id: 12,
    icon: PartyPopper,
    name: 'Promotional Events',
    description: 'Strategic planning and execution of promotional events for product launches and marketing campaigns.'
  }
];

export function Services() {
  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Services</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Comprehensive event management solutions for every occasion
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-orange-500/50"
              >
                <IconComponent className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}