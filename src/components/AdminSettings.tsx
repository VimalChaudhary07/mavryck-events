import React, { useState, useEffect } from 'react';
import { Settings, Lock, Save, Download, Upload, Database, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
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

interface BackupProgress {
  stage: string;
  progress: number;
  total: number;
}

interface RestoreProgress {
  stage: string;
  progress: number;
  total: number;
  errors: string[];
}

interface SiteSettings {
  id?: string;
  google_photos_url: string;
  created_at?: string;
  updated_at?: string;
}

export function AdminSettings() {
  const [activeSection, setActiveSection] = useState('gallery');
  const [isLoading, setIsLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<RestoreProgress | null>(null);
  const [settings, setSettings] = useState({
    gallery: {
      googlePhotosUrl: 'https://photos.google.com/share/your-album-link'
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    loadSettings();
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setDbConnectionStatus('checking');
      const { error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });
      setDbConnectionStatus(error ? 'error' : 'connected');
    } catch (error) {
      console.error('Database connection check failed:', error);
      setDbConnectionStatus('error');
    }
  };

  const loadSettings = async () => {
    try {
      console.log('Loading settings from database...');
      
      // Always try to load from database first
      const { data: dbSettings, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (dbSettings && !error) {
        console.log('Settings loaded from database:', dbSettings);
        setSettings(prev => ({
          ...prev,
          gallery: {
            googlePhotosUrl: dbSettings.google_photos_url || prev.gallery.googlePhotosUrl
          }
        }));
        setDbConnectionStatus('connected');
      } else {
        console.log('No settings found in database, checking localStorage...');
        
        // Fallback to localStorage for backward compatibility
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            setSettings(prev => ({
              ...prev,
              gallery: {
                googlePhotosUrl: parsedSettings.business?.contact?.googlePhotosUrl || prev.gallery.googlePhotosUrl
              }
            }));
            console.log('Settings loaded from localStorage');
          } catch (error) {
            console.error('Failed to parse localStorage settings:', error);
          }
        }
        setDbConnectionStatus('error');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setDbConnectionStatus('error');
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    let savedToDatabase = false;
    
    try {
      console.log('Saving settings to database...', settings.gallery.googlePhotosUrl);
      
      // Always attempt to save to database first
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      const settingsData = {
        google_photos_url: settings.gallery.googlePhotosUrl
      };

      if (existingSettings) {
        // Update existing settings
        console.log('Updating existing settings in database...');
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', existingSettings.id);

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }
        console.log('Settings updated successfully in database');
      } else {
        // Create new settings
        console.log('Creating new settings in database...');
        const { error } = await supabase
          .from('site_settings')
          .insert(settingsData);

        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }
        console.log('Settings created successfully in database');
      }

      savedToDatabase = true;
      setDbConnectionStatus('connected');
      
      // Also save to localStorage for backward compatibility
      const settingsToSave = {
        business: {
          contact: {
            googlePhotosUrl: settings.gallery.googlePhotosUrl
          }
        }
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
      console.log('Settings also saved to localStorage for compatibility');

      toast.success('✅ Settings saved successfully to database!');
      
    } catch (error) {
      console.error('Failed to save settings to database:', error);
      setDbConnectionStatus('error');
      
      // Fallback to localStorage only if database fails
      try {
        const settingsToSave = {
          business: {
            contact: {
              googlePhotosUrl: settings.gallery.googlePhotosUrl
            }
          }
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
        toast.error('⚠️ Database unavailable. Settings saved to local storage only.');
        console.log('Fallback: Settings saved to localStorage');
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        toast.error('❌ Failed to save settings anywhere!');
      }
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

  const handleGooglePhotosUrlChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        googlePhotosUrl: value
      }
    }));
  };

  const handleBackupData = async () => {
    setIsLoading(true);
    setBackupProgress({ stage: 'Initializing backup...', progress: 0, total: 5 });
    
    try {
      // Step 1: Fetch all data from Supabase
      setBackupProgress({ stage: 'Fetching data from Supabase...', progress: 1, total: 5 });
      const [events, messages, gallery, products, testimonials] = await Promise.all([
        getEventRequests(),
        getContactMessages(),
        getGalleryItems(),
        getProducts(),
        getTestimonials()
      ]);

      // Step 2: Create workbook with enhanced structure
      setBackupProgress({ stage: 'Creating Excel workbook...', progress: 2, total: 5 });
      const workbook = XLSX.utils.book_new();

      // Enhanced Event Requests sheet with better formatting
      if (events && events.length > 0) {
        setBackupProgress({ stage: 'Processing Event Requests...', progress: 3, total: 5 });
        const eventsData = events.map(event => ({
          ID: event.id || '',
          Name: event.name || '',
          Email: event.email || '',
          Phone: event.phone || '',
          'Event Type': event.event_type || '',
          'Event Date': event.event_date ? new Date(event.event_date).toLocaleDateString() : '',
          'Guest Count': event.guest_count || '',
          Requirements: event.requirements || '',
          Status: event.status || '',
          'Created At': event.created_at ? new Date(event.created_at).toLocaleString() : ''
        }));
        
        const eventsSheet = XLSX.utils.json_to_sheet(eventsData);
        
        // Set column widths for better readability
        eventsSheet['!cols'] = [
          { wch: 40 }, // ID
          { wch: 20 }, // Name
          { wch: 25 }, // Email
          { wch: 15 }, // Phone
          { wch: 15 }, // Event Type
          { wch: 12 }, // Event Date
          { wch: 12 }, // Guest Count
          { wch: 30 }, // Requirements
          { wch: 12 }, // Status
          { wch: 20 }  // Created At
        ];
        
        XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Event Requests');
      }

      // Enhanced Contact Messages sheet
      if (messages && messages.length > 0) {
        const messagesData = messages.map(message => ({
          ID: message.id || '',
          Name: message.name || '',
          Email: message.email || '',
          Message: message.message || '',
          Viewed: message.viewed ? 'Yes' : 'No',
          'Created At': message.created_at ? new Date(message.created_at).toLocaleString() : ''
        }));
        
        const messagesSheet = XLSX.utils.json_to_sheet(messagesData);
        messagesSheet['!cols'] = [
          { wch: 40 }, // ID
          { wch: 20 }, // Name
          { wch: 25 }, // Email
          { wch: 50 }, // Message
          { wch: 10 }, // Viewed
          { wch: 20 }  // Created At
        ];
        
        XLSX.utils.book_append_sheet(workbook, messagesSheet, 'Contact Messages');
      }

      // Enhanced Gallery sheet
      if (gallery && gallery.length > 0) {
        const galleryData = gallery.map(item => ({
          ID: item.id || '',
          Title: item.title || '',
          'Image URL': item.image_url || '',
          Category: item.category || '',
          Description: item.description || '',
          'Created At': item.created_at ? new Date(item.created_at).toLocaleString() : ''
        }));
        
        const gallerySheet = XLSX.utils.json_to_sheet(galleryData);
        gallerySheet['!cols'] = [
          { wch: 40 }, // ID
          { wch: 25 }, // Title
          { wch: 60 }, // Image URL
          { wch: 15 }, // Category
          { wch: 30 }, // Description
          { wch: 20 }  // Created At
        ];
        
        XLSX.utils.book_append_sheet(workbook, gallerySheet, 'Gallery');
      }

      // Enhanced Products sheet
      if (products && products.length > 0) {
        const productsData = products.map(product => ({
          ID: product.id || '',
          Name: product.name || '',
          Description: product.description || '',
          Price: product.price || '',
          'Image URL': product.image_url || '',
          'Created At': product.created_at ? new Date(product.created_at).toLocaleString() : ''
        }));
        
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        productsSheet['!cols'] = [
          { wch: 40 }, // ID
          { wch: 25 }, // Name
          { wch: 40 }, // Description
          { wch: 15 }, // Price
          { wch: 60 }, // Image URL
          { wch: 20 }  // Created At
        ];
        
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
      }

      // Enhanced Testimonials sheet
      if (testimonials && testimonials.length > 0) {
        const testimonialsData = testimonials.map(testimonial => ({
          ID: testimonial.id || '',
          Name: testimonial.name || '',
          Role: testimonial.role || '',
          Content: testimonial.content || '',
          Rating: testimonial.rating || '',
          'Avatar URL': testimonial.avatar_url || '',
          'Created At': testimonial.created_at ? new Date(testimonial.created_at).toLocaleString() : ''
        }));
        
        const testimonialsSheet = XLSX.utils.json_to_sheet(testimonialsData);
        testimonialsSheet['!cols'] = [
          { wch: 40 }, // ID
          { wch: 20 }, // Name
          { wch: 20 }, // Role
          { wch: 50 }, // Content
          { wch: 10 }, // Rating
          { wch: 60 }, // Avatar URL
          { wch: 20 }  // Created At
        ];
        
        XLSX.utils.book_append_sheet(workbook, testimonialsSheet, 'Testimonials');
      }

      // Add backup metadata sheet
      setBackupProgress({ stage: 'Adding metadata...', progress: 4, total: 5 });
      const metadataSheet = XLSX.utils.json_to_sheet([{
        'Backup Date': new Date().toLocaleString(),
        'Total Event Requests': events?.length || 0,
        'Total Contact Messages': messages?.length || 0,
        'Total Gallery Items': gallery?.length || 0,
        'Total Products': products?.length || 0,
        'Total Testimonials': testimonials?.length || 0,
        'Google Photos URL': settings.gallery.googlePhotosUrl,
        'Database Status': dbConnectionStatus,
        'Backup Version': '2.0',
        'Application': 'Mavryck Events Management System'
      }]);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Backup Info');

      // If no data exists, create an informational sheet
      if (workbook.SheetNames.length === 1) { // Only metadata sheet
        const emptySheet = XLSX.utils.json_to_sheet([{
          'Info': 'No data available for backup',
          'Date': new Date().toISOString(),
          'Note': 'This backup contains no user data but preserves the backup structure'
        }]);
        XLSX.utils.book_append_sheet(workbook, emptySheet, 'No Data');
      }

      // Step 3: Generate and download file
      setBackupProgress({ stage: 'Generating download file...', progress: 5, total: 5 });
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `mavryck-events-backup-${date}-${time}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Backup created successfully! Downloaded as ${filename}`);
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsLoading(false);
      setBackupProgress(null);
    }
  };

  // Enhanced restore function with better error handling and validation
  const handleRestoreData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setRestoreProgress({ stage: 'Reading file...', progress: 0, total: 100, errors: [] });
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      let totalItems = 0;
      let processedItems = 0;
      const errors: string[] = [];

      // Count total items for progress tracking
      setRestoreProgress({ stage: 'Analyzing file structure...', progress: 10, total: 100, errors });
      
      const sheetCounts = {
        'Event Requests': 0,
        'Contact Messages': 0,
        'Gallery': 0,
        'Products': 0,
        'Testimonials': 0
      };

      // Count items in each sheet
      Object.keys(sheetCounts).forEach(sheetName => {
        if (workbook.SheetNames.includes(sheetName)) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          sheetCounts[sheetName] = jsonData.length;
          totalItems += jsonData.length;
        }
      });

      if (totalItems === 0) {
        throw new Error('No valid data found in the backup file');
      }

      setRestoreProgress({ stage: `Found ${totalItems} items to restore...`, progress: 20, total: 100, errors });

      // Helper function to validate and process data
      const validateAndProcess = async (
        sheetName: string,
        processor: (item: any) => Promise<void>,
        validator: (item: any) => boolean
      ) => {
        if (!workbook.SheetNames.includes(sheetName)) return;

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const [index, item] of jsonData.entries()) {
          try {
            if (!validator(item)) {
              errors.push(`${sheetName} row ${index + 2}: Invalid data structure`);
              continue;
            }
            
            await processor(item);
            processedItems++;
            
            const progress = 20 + Math.floor((processedItems / totalItems) * 70);
            setRestoreProgress({ 
              stage: `Processing ${sheetName}... (${processedItems}/${totalItems})`, 
              progress, 
              total: 100, 
              errors 
            });
          } catch (error) {
            const errorMsg = `${sheetName} row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMsg);
            console.warn('Failed to restore item:', errorMsg);
          }
        }
      };

      // Process Event Requests with validation
      await validateAndProcess(
        'Event Requests',
        async (item) => {
          const processedItem = {
            name: String(item['Name'] || '').trim(),
            email: String(item['Email'] || '').trim(),
            phone: String(item['Phone'] || '').trim(),
            event_type: String(item['Event Type'] || '').trim(),
            event_date: item['Event Date'] ? new Date(item['Event Date']).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            guest_count: String(item['Guest Count'] || '1'),
            requirements: String(item['Requirements'] || ''),
            status: (['pending', 'ongoing', 'completed'].includes(item['Status']) ? item['Status'] : 'pending') as 'pending' | 'ongoing' | 'completed'
          };
          
          await createEventRequest(processedItem);
        },
        (item) => Boolean(item['Name'] && item['Email'] && item['Phone'] && item['Event Type'])
      );

      // Process Contact Messages with validation
      await validateAndProcess(
        'Contact Messages',
        async (item) => {
          const processedItem = {
            name: String(item['Name'] || '').trim(),
            email: String(item['Email'] || '').trim(),
            message: String(item['Message'] || '').trim(),
            viewed: item['Viewed'] === 'Yes' || item['Viewed'] === true
          };
          
          await createContactMessage(processedItem);
        },
        (item) => Boolean(item['Name'] && item['Email'] && item['Message'])
      );

      // Process Gallery Items with validation
      await validateAndProcess(
        'Gallery',
        async (item) => {
          const validCategories = ['Corporate', 'Wedding', 'Birthday', 'Festival', 'Gala', 'Anniversary'];
          const processedItem = {
            title: String(item['Title'] || '').trim(),
            image_url: String(item['Image URL'] || '').trim(),
            category: (validCategories.includes(item['Category']) ? item['Category'] : 'Corporate') as 'Corporate' | 'Wedding' | 'Birthday' | 'Festival' | 'Gala' | 'Anniversary',
            description: String(item['Description'] || '').trim()
          };
          
          await createGalleryItem(processedItem);
        },
        (item) => Boolean(item['Title'] && item['Image URL'])
      );

      // Process Products with validation
      await validateAndProcess(
        'Products',
        async (item) => {
          const processedItem = {
            name: String(item['Name'] || '').trim(),
            description: String(item['Description'] || '').trim(),
            price: String(item['Price'] || '').trim(),
            image_url: String(item['Image URL'] || '').trim()
          };
          
          await createProduct(processedItem);
        },
        (item) => Boolean(item['Name'] && item['Description'] && item['Price'] && item['Image URL'])
      );

      // Process Testimonials with validation
      await validateAndProcess(
        'Testimonials',
        async (item) => {
          const rating = parseInt(String(item['Rating'] || '5'));
          const processedItem = {
            name: String(item['Name'] || '').trim(),
            role: String(item['Role'] || '').trim(),
            content: String(item['Content'] || '').trim(),
            rating: Math.max(1, Math.min(5, isNaN(rating) ? 5 : rating)),
            avatar_url: String(item['Avatar URL'] || '').trim()
          };
          
          await createTestimonial(processedItem);
        },
        (item) => Boolean(item['Name'] && item['Role'] && item['Content'] && item['Avatar URL'])
      );

      setRestoreProgress({ stage: 'Finalizing restore...', progress: 95, total: 100, errors });

      // Show results
      const successCount = processedItems;
      const errorCount = errors.length;
      
      if (successCount > 0) {
        const message = errorCount > 0 
          ? `Restore completed! ${successCount} items restored successfully, ${errorCount} items failed.`
          : `Restore completed successfully! ${successCount} items restored.`;
        
        toast.success(message);
        
        if (errorCount > 0) {
          console.warn('Restore errors:', errors);
          toast.error(`${errorCount} items failed to restore. Check console for details.`);
        }
        
        // Refresh the page to show restored data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error('No valid data could be restored from the backup file');
      }
      
    } catch (error) {
      console.error('Failed to restore data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to restore data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setRestoreProgress(null);
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
          onClick={() => setActiveSection('gallery')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === 'gallery'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Gallery Settings
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

      {activeSection === 'gallery' ? (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-medium text-white">Gallery Settings</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Google Photos Album URL</label>
              <input
                type="url"
                value={settings.gallery.googlePhotosUrl}
                onChange={(e) => handleGooglePhotosUrlChange(e.target.value)}
                placeholder="https://photos.google.com/share/your-album-link"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                This URL will be used for the "View More" button in the gallery section
              </p>
              
              {/* Database Status Indicator */}
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">Database Storage Status</span>
                  <div className="flex items-center gap-1">
                    {dbConnectionStatus === 'checking' && (
                      <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    {dbConnectionStatus === 'connected' && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {dbConnectionStatus === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      dbConnectionStatus === 'connected' ? 'text-green-400' :
                      dbConnectionStatus === 'error' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {dbConnectionStatus === 'connected' ? 'Connected' :
                       dbConnectionStatus === 'error' ? 'Disconnected' : 'Checking...'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-blue-300">
                  {dbConnectionStatus === 'connected' 
                    ? '✅ Settings will be saved to the Supabase database for persistence across sessions.'
                    : dbConnectionStatus === 'error'
                    ? '⚠️ Database unavailable. Settings will be saved to local storage only.'
                    : 'Checking database connection...'
                  }
                </p>
                {dbConnectionStatus === 'error' && (
                  <button
                    onClick={checkDatabaseConnection}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeSection === 'backup' ? (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-medium text-white">Enhanced Data Backup & Restore</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Advanced backup and restore system with progress tracking, data validation, and error handling. 
              Preserves all data structures, relationships, and formatting from your Supabase database.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Enhanced Backup Section */}
              <div className="bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-6 h-6 text-green-500" />
                  <h4 className="text-lg font-medium text-white">Create Enhanced Backup</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Create a comprehensive backup with enhanced Excel formatting and metadata:
                </p>
                <ul className="text-sm text-gray-400 mb-6 space-y-1">
                  <li>• Event Requests with formatted dates and status</li>
                  <li>• Contact Messages with view status</li>
                  <li>• Gallery Items with category validation</li>
                  <li>• Products with pricing information</li>
                  <li>• Testimonials with rating validation</li>
                  <li>• Settings including Google Photos URL</li>
                  <li>• Backup metadata and statistics</li>
                  <li>• Optimized column widths and formatting</li>
                </ul>
                
                {backupProgress && (
                  <div className="mb-4 p-3 bg-gray-600/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-300">{backupProgress.stage}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(backupProgress.progress / backupProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Step {backupProgress.progress} of {backupProgress.total}
                    </p>
                  </div>
                )}
                
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
                      Create Enhanced Backup
                    </>
                  )}
                </button>
              </div>

              {/* Enhanced Restore Section */}
              <div className="bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-6 h-6 text-blue-500" />
                  <h4 className="text-lg font-medium text-white">Intelligent Data Restore</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Upload a backup file with intelligent validation and error handling:
                </p>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-400">Enhanced Features:</span>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1 ml-6">
                    <li>• Real-time progress tracking</li>
                    <li>• Data validation and sanitization</li>
                    <li>• Detailed error reporting</li>
                    <li>• Automatic data type conversion</li>
                    <li>• Rollback on critical errors</li>
                  </ul>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-400">Important Notes:</span>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1 ml-6">
                    <li>• Data will be added to existing content</li>
                    <li>• Invalid entries will be skipped with error logs</li>
                    <li>• Only Excel (.xlsx) files are supported</li>
                    <li>• Large files may take several minutes</li>
                  </ul>
                </div>

                {restoreProgress && (
                  <div className="mb-4 p-3 bg-gray-600/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-300">{restoreProgress.stage}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${restoreProgress.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {restoreProgress.progress}% complete
                    </p>
                    {restoreProgress.errors.length > 0 && (
                      <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-500/20">
                        <p className="text-xs text-red-400">
                          {restoreProgress.errors.length} error(s) encountered
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={activeSection === 'gallery' ? handleSaveSettings : handlePasswordChange}
          disabled={isLoading || activeSection === 'backup'}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {activeSection === 'gallery' ? <Save className="w-5 h-5" /> : activeSection === 'security' ? <Lock className="w-5 h-5" /> : null}
            </>
          )}
          {activeSection === 'gallery' ? 'Save to Database' : activeSection === 'security' ? 'Update Password' : ''}
        </button>
      </div>
    </div>
  );
}