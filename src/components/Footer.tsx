import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, Phone, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-8 w-8 text-orange-500" />
              <span className="text-white font-bold text-xl">Mavryck Events</span>
            </div>
            <p className="text-gray-400 mb-4">
              Creating memorable events and unforgettable experiences.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/mavryck_events" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <div className="flex flex-col">
                  <a href="mailto:mr.gupta881@gmail.com" className="text-gray-400 hover:text-orange-500 transition-colors">
                    mr.gupta881@gmail.com
                  </a>
                  <a href="mailto:mavryckevents@gmail.com" className="text-gray-400 hover:text-orange-500 transition-colors">
                   mavryckevents@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <a href="tel:+917045712235" className="text-gray-400 hover:text-orange-500 transition-colors">
                  +91 7045712235
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-orange-500" />
                <a 
                  href="https://www.instagram.com/mavryck_events" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  @mavryck_event
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              © {new Date().getFullYear()} Mavryck Events. All rights reserved.
            </p>
            <p className="text-sm">
              Built by Tech Trio: Vimal Chaudhary, Sujal Bhul, Kailash Gupta
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
