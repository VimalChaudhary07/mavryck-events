import { useState, useEffect } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { Link } from './Link';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../lib/auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = isAuthenticated();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    setIsOpen(false); // Close mobile menu
  };

  const handleHomeClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/95 backdrop-blur-md shadow-lg' 
        : 'bg-black/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 group"
            >
              <Calendar className="h-8 w-8 text-orange-500 group-hover:text-orange-400 transition-colors" />
              <span className="text-white font-bold text-xl group-hover:text-orange-400 transition-colors">
                mavryck_events
              </span>
            </button>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={handleHomeClick}
                className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm font-medium"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm font-medium"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('gallery')}
                className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm font-medium"
              >
                Gallery
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm font-medium"
              >
                Contact
              </button>
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
              className="text-gray-400 hover:text-white focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={handleHomeClick}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-orange-500 transition-colors duration-200"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-3 py-2  text-base font-medium text-gray-300 hover:text-orange-500 transition-colors duration-200"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-orange-500 transition-colors duration-200"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-orange-500 transition-colors duration-200"
            >
              Contact
            </button>
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