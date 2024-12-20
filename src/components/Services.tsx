import React from 'react';
import { Calendar, Gift, Heart, Building2, Music, Star, Award, PartyPopper, MapPin, Paintbrush, HeartHandshake, Home, Users } from 'lucide-react';

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
    <section id="services" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive event management solutions for every occasion
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-gray-800 rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-300"
              >
                <IconComponent className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}