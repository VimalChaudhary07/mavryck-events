import React, { useState, useEffect } from 'react';
import { Settings, Clock, Lock, Mail, Phone, MapPin, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const SETTINGS_KEY = 'siteSettings';

export function AdminSettings() {
  const [activeSection, setActiveSection] = useState('business');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    business: {
      hours: {
        monday: { open: '07:00', close: '19:00' },
        tuesday: { open: '07:00', close: '19:00' },
        wednesday: { open: '07:00', close: '19:00' },
        thursday: { open: '07:00', close: '19:00' },
        friday: { open: '07:00', close: '19:00' },
        saturday: { open: '07:00', close: '19:00' },
        sunday: { open: '07:00', close: '19:00' },
      },
      contact: {
        email: 'contact@festive.finesse.events',
        phone: '+91 1234567890',
        address: '123 Event Street, City, State, India',
        website: 'https://festive.finesse.events'
      }
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (settings.security.newPassword !== settings.security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // In a real application, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      setSettings(prev => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }));
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessSettingChange = (section: string, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        [section]: {
          ...prev.business[section],
          [field]: value
        }
      }
    }));
  };

  const handleHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        hours: {
          ...prev.business.hours,
          [day]: {
            ...prev.business.hours[day],
            [type]: value
          }
        }
      }
    }));
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveSection('business')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === 'business'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Business Settings
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === 'security'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Security Settings
        </button>
      </div>

      {activeSection === 'business' ? (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-medium text-white">Business Hours</h3>
            </div>
            <div className="grid gap-4">
              {Object.entries(settings.business.hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-32 text-gray-300 capitalize">{day}</span>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-medium text-white">Contact Information</h3>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.business.contact.email}
                  onChange={(e) => handleBusinessSettingChange('contact', 'email', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={settings.business.contact.phone}
                  onChange={(e) => handleBusinessSettingChange('contact', 'phone', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  value={settings.business.contact.address}
                  onChange={(e) => handleBusinessSettingChange('contact', 'address', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  value={settings.business.contact.website}
                  onChange={(e) => handleBusinessSettingChange('contact', 'website', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-medium text-white">Change Password</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              value={settings.security.currentPassword}
              onChange={(e) =>
                setSettings(prev => ({
                  ...prev,
                  security: {
                    ...prev.security,
                    currentPassword: e.target.value
                  }
                }))
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={settings.security.newPassword}
              onChange={(e) =>
                setSettings(prev => ({
                  ...prev,
                  security: {
                    ...prev.security,
                    newPassword: e.target.value
                  }
                }))
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={settings.security.confirmPassword}
              onChange={(e) =>
                setSettings(prev => ({
                  ...prev,
                  security: {
                    ...prev.security,
                    confirmPassword: e.target.value
                  }
                }))
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={activeSection === 'business' ? handleSaveSettings : handlePasswordChange}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {activeSection === 'business' ? <Save className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </>
          )}
          {activeSection === 'business' ? 'Save Changes' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}