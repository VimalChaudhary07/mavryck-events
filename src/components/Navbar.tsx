import React, { useState } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { Link } from './Link';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../lib/auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-black/95 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-orange-500" />
              <span className="text-white font-bold text-xl">mavryck_events</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/">Home</Link>
              <Link href="#services">Services</Link>
              <Link href="#gallery">Gallery</Link>
              <Link href="#contact">Contact</Link>
              {auth ? (
                <>
                  <Link href="/admin/dashboard">Dashboard</Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/admin">Admin</Link>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" mobile>Home</Link>
            <Link href="#services" mobile>Services</Link>
            <Link href="#gallery" mobile>Gallery</Link>
            <Link href="#contact" mobile>Contact</Link>
            {auth ? (
              <>
                <Link href="/admin/dashboard" mobile>Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-orange-500 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/admin" mobile>Admin</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
