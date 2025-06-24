import React, { useState, useEffect } from 'react';
import { Settings, Clock, Lock, Mail, Phone, MapPin, Globe, Save, Download, Upload, Database, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getEventRequests, 
  getContactMessages, 
  getGalleryItems, 
  getProducts, 
  getTestimonials,
  createEventRequest,
  createContactMessage,
  createGalleryItem,
  createProduct,
  createTestimonial
} from '../lib/database';
import * as XLSX from 'xlsx';

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
        website: 'https://festive.finesse.events',
        googlePhotosUrl: 'https://photos.google.com/share/your-album-link'
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

  const handleBackupData = async () => {
    setIsLoading(true);
    try {
      // Get all data from Supabase
      const [events, messages, gallery, products, testimonials] = await Promise.all([
        getEventRequests(),
        getContactMessages(),
        getGalleryItems(),
        getProducts(),
        getTestimonials()
      ]);

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();

      // Add Events sheet - ensure data is properly formatted
      if (events && events.length > 0) {
        const eventsSheet = XLSX.utils.json_to_sheet(events.map(event => ({
          ID: event.id || '',
          Name: event.name || '',
          Email: event.email || '',
          Phone: event.phone || '',
          'Event Type': event.event_type || '',
          'Event Date': event.event_date || '',
          'Guest Count': event.guest_count || '',
          Requirements: event.requirements || '',
          Status: event.status || '',
          'Created At': event.created_at || ''
        })));
        XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Event Requests');
      }

      // Add Messages sheet
      if (messages && messages.length > 0) {
        const messagesSheet = XLSX.utils.json_to_sheet(messages.map(message => ({
          ID: message.id || '',
          Name: message.name || '',
          Email: message.email || '',
          Message: message.message || '',
          Viewed: message.viewed ? 'Yes' : 'No',
          'Created At': message.created_at || ''
        })));
        XLSX.utils.book_append_sheet(workbook, messagesSheet, 'Contact Messages');
      }

      // Add Gallery sheet
      if (gallery && gallery.length > 0) {
        const gallerySheet = XLSX.utils.json_to_sheet(gallery.map(item => ({
          ID: item.id || '',
          Title: item.title || '',
          'Image URL': item.image_url || '',
          Category: item.category || '',
          Description: item.description || '',
          'Created At': item.created_at || ''
        })));
        XLSX.utils.book_append_sheet(workbook, gallerySheet, 'Gallery');
      }

      // Add Products sheet
      if (products && products.length > 0) {
        const productsSheet = XLSX.utils.json_to_sheet(products.map(product => ({
          ID: product.id || '',
          Name: product.name || '',
          Description: product.description || '',
          Price: product.price || '',
          'Image URL': product.image_url || '',
          'Created At': product.created_at || ''
        })));
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
      }

      // Add Testimonials sheet
      if (testimonials && testimonials.length > 0) {
        const testimonialsSheet = XLSX.utils.json_to_sheet(testimonials.map(testimonial => ({
          ID: testimonial.id || '',
          Name: testimonial.name || '',
          Role: testimonial.role || '',
          Content: testimonial.content || '',
          Rating: testimonial.rating || '',
          'Avatar URL': testimonial.avatar_url || '',
          'Created At': testimonial.created_at || ''
        })));
        XLSX.utils.book_append_sheet(workbook, testimonialsSheet, 'Testimonials');
      }

      // If no data exists, create a sheet with headers
      if (workbook.SheetNames.length === 0) {
        const emptySheet = XLSX.utils.json_to_sheet([{
          'Info': 'No data available for backup',
          'Date': new Date().toISOString()
        }]);
        XLSX.utils.book_append_sheet(workbook, emptySheet, 'Info');
      }

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `mavryck-events-backup-${date}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
      
      toast.success('Backup created successfully!');
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to ensure valid rating
  const getValidRating = (rating: any): number => {
    const numRating = parseInt(rating);
    return Math.max(1, Math.min(5, numRating || 1));
  };

  const handleRestoreData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      let restoredCount = 0;
      let errorCount = 0;

      // Process Event Requests
      if (workbook.SheetNames.includes('Event Requests')) {
        const worksheet = workbook.Sheets['Event Requests'];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const item of jsonData) {
          try {
            const processedItem = {
              name: item['Name'] || '',
              email: item['Email'] || '',
              phone: item['Phone'] || '',
              event_type: item['Event Type'] || '',
              event_date: item['Event Date'] || '',
              guest_count: item['Guest Count'] || '',
              requirements: item['Requirements'] || '',
              status: (item['Status'] || 'pending') as 'pending' | 'ongoing' | 'completed'
            };
            
            await createEventRequest(processedItem);
            restoredCount++;
          } catch (error) {
            console.warn('Failed to restore event request:', error);
            errorCount++;
          }
        }
      }

      // Process Contact Messages
      if (workbook.SheetNames.includes('Contact Messages')) {
        const worksheet = workbook.Sheets['Contact Messages'];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const item of jsonData) {
          try {
            const processedItem = {
              name: item['Name'] || '',
              email: item['Email'] || '',
              message: item['Message'] || '',
              viewed: item['Viewed'] === 'Yes'
            };
            
            await createContactMessage(processedItem);
            restoredCount++;
          } catch (error) {
            console.warn('Failed to restore contact message:', error);
            errorCount++;
          }
        }
      }

      // Process Gallery Items
      if (workbook.SheetNames.includes('Gallery')) {
        const worksheet = workbook.Sheets['Gallery'];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const item of jsonData) {
          try {
            const processedItem = {
              title: item['Title'] || '',
              image_url: item['Image URL'] || '',
              category: (item['Category'] || 'Corporate') as 'Corporate' | 'Wedding' | 'Birthday' | 'Festival' | 'Gala' | 'Anniversary',
              description: item['Description'] || ''
            };
            
            await createGalleryItem(processedItem);
            restoredCount++;
          } catch (error) {
            console.warn('Failed to restore gallery item:', error);
            errorCount++;
          }
        }
      }

      // Process Products
      if (workbook.SheetNames.includes('Products')) {
        const worksheet = workbook.Sheets['Products'];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const item of jsonData) {
          try {
            const processedItem = {
              name: item['Name'] || '',
              description: item['Description'] || '',
              price: item['Price'] || '',
              image_url: item['Image URL'] || ''
            };
            
            await createProduct(processedItem);
            restoredCount++;
          } catch (error) {
            console.warn('Failed to restore product:', error);
            errorCount++;
          }
        }
      }

      // Process Testimonials
      if (workbook.SheetNames.includes('Testimonials')) {
        const worksheet = workbook.Sheets['Testimonials'];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const item of jsonData) {
          try {
            const processedItem = {
              name: item['Name'] || '',
              role: item['Role'] || '',
              content: item['Content'] || '',
              rating: getValidRating(item['Rating']),
              avatar_url: item['Avatar URL'] || ''
            };
            
            await createTestimonial(processedItem);
            restoredCount++;
          } catch (error) {
            console.warn('Failed to restore testimonial:', error);
            errorCount++;
          }
        }
      }

      if (restoredCount > 0) {
        toast.success(`Data restored successfully! ${restoredCount} items restored${errorCount > 0 ? `, ${errorCount} items failed` : ''}.`);
        // Refresh the page to show restored data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error('No valid data found in the backup file');
      }
    } catch (error) {
      console.error('Failed to restore data:', error);
      toast.error('Failed to restore data. Please check the file format.');
    } finally {
      setIsLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
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
          onClick={() => setActiveSection('backup')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === 'backup'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Backup & Restore
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Google Photos Album URL</label>
                <input
                  type="url"
                  value={settings.business.contact.googlePhotosUrl}
                  onChange={(e) => handleBusinessSettingChange('contact', 'googlePhotosUrl', e.target.value)}
                  placeholder="https://photos.google.com/share/your-album-link"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  This URL will be used for the "View More" button in the gallery section
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : activeSection === 'backup' ? (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-medium text-white">Data Backup & Restore</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Create backups of all your data from Supabase including events, messages, gallery, products, and testimonials. 
              You can also restore data from a previously created backup file directly through this admin panel.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Backup Section */}
              <div className="bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-6 h-6 text-green-500" />
                  <h4 className="text-lg font-medium text-white">Create Backup</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Download all your data from Supabase as an Excel file. This includes:
                </p>
                <ul className="text-sm text-gray-400 mb-6 space-y-1">
                  <li>• Event Requests</li>
                  <li>• Contact Messages</li>
                  <li>• Gallery Items</li>
                  <li>• Products</li>
                  <li>• Testimonials</li>
                </ul>
                <button
                  onClick={handleBackupData}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Create Backup
                    </>
                  )}
                </button>
              </div>

              {/* Restore Section */}
              <div className="bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-6 h-6 text-blue-500" />
                  <h4 className="text-lg font-medium text-white">Restore Data</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Upload a backup file to restore your data directly to Supabase. This will add the data to your existing content.
                </p>
                <div className="mb-4">
                  <p className="text-sm text-yellow-400 mb-2">⚠️ Important Notes:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Data will be added to existing content</li>
                    <li>• Duplicate entries may be created</li>
                    <li>• Only Excel (.xlsx) files are supported</li>
                    <li>• Process may take a few minutes for large files</li>
                  </ul>
                </div>
                <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Choose Backup File
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleRestoreData}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
                {isLoading && (
                  <div className="mt-4 text-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Restoring data...</p>
                  </div>
                )}
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
          disabled={isLoading || activeSection === 'backup'}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {activeSection === 'business' ? <Save className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </>
          )}
          {activeSection === 'business' ? 'Save Changes' : activeSection === 'security' ? 'Update Password' : ''}
        </button>
      </div>
    </div>
  );
}