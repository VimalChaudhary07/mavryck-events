import React, { useMemo } from 'react';
import { Calendar, Gift, Heart, Building2, Music, Star, Award, PartyPopper, MapPin, Paintbrush, HeartHandshake, Home, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    id: 1,
    icon: Calendar,
    name: 'Event Planning',
    description: 'Full-scale event planning and management services including venue selection, scheduling, and coordination.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    icon: MapPin,
    name: 'Venue Selection',
    description: 'Expert assistance in choosing the perfect venue that aligns with your event theme, size, and requirements.',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    icon: Paintbrush,
    name: 'Design And Decor',
    description: 'Creative design and decor services to transform spaces according to your event theme and vision.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    icon: Heart,
    name: 'Wedding Events',
    description: 'Comprehensive wedding planning and coordination, creating magical moments for your special day.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 5,
    icon: Building2,
    name: 'Corporate Events',
    description: 'Professional corporate event management for conferences, seminars, and team buildings.',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 6,
    icon: HeartHandshake,
    name: 'Charity Events',
    description: 'Comprehensive planning for fundraisers and charitable events, maximizing impact and support for noble causes.',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 7,
    icon: Home,
    name: 'House Parties',
    description: 'Personalized planning for private house parties, ensuring seamless experiences without the stress of organizing.',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 8,
    icon: Users,
    name: 'Reunions Events',
    description: 'Tailored coordination for family, school, or alumni reunions, fostering connections and creating memories.',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 9,
    icon: Gift,
    name: 'Birthday Events',
    description: 'Customized birthday celebrations with unique themes, entertainment, and memorable experiences.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 10,
    icon: Music,
    name: 'Festival Events',
    description: 'Large-scale festival organization for cultural and entertainment events.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 11,
    icon: Star,
    name: 'Anniversary Events',
    description: 'Special anniversary celebrations with personalized touches and memorable moments.',
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 12,
    icon: PartyPopper,
    name: 'Promotional Events',
    description: 'Strategic planning and execution of promotional events for product launches and marketing campaigns.',
    color: 'from-rose-500 to-rose-600'
  }
];

export function Services() {
  // Memoize animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }), []);

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
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
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive event management solutions tailored to make your special occasions unforgettable
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 relative overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-sm group-hover:text-gray-700 transition-colors duration-300">
                    {service.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -translate-y-10 translate-x-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Plan Your Perfect Event?</h3>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Let our experienced team help you create an unforgettable experience that exceeds your expectations.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors duration-300"
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}