import React, { useState, useEffect } from 'react';
import { 
  updateUserEmail, 
  updateUserPassword, 
  getCurrentUser,
  exportDatabaseBackup,
  importDatabaseBackup,
  updateGooglePhotosUrl,
  getGooglePhotosUrl
} from '../lib/auth';
import { User, Lock, Download, Upload, Camera, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googlePhotosUrl, setGooglePhotosUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    loadUserData();
    loadGooglePhotosUrl();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.email) {
        setCurrentEmail(user.email);
        setNewEmail(user.email);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadGooglePhotosUrl = async () => {
    try {
      const url = await getGooglePhotosUrl();
      setGooglePhotosUrl(url);
    } catch (error) {
      console.error('Error loading Google Photos URL:', error);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || newEmail === currentEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateUserEmail(newEmail);
      if (success) {
        setCurrentEmail(newEmail);
      }
    } catch (error) {
      console.error('Email change error:', error);
      toast.error('Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateUserPassword(newPassword);
      if (success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackup = async () => {
    setIsLoading(true);
    try {
      await exportDatabaseBackup();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a valid JSON backup file');
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await file.text();
      const success = await importDatabaseBackup(fileContent);
      if (success) {
        // Reset file input
        event.target.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryUrlUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!googlePhotosUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      await updateGooglePhotosUrl(googlePhotosUrl);
    } catch (error) {
      console.error('Gallery URL update error:', error);
      toast.error('Failed to update Gallery URL');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'backup', label: 'Backup & Restore', icon: Download },
    { id: 'gallery', label: 'Gallery Settings', icon: Camera }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          <p className="text-orange-100 mt-1">Manage your account and system settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Email Change Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-500" />
                  Change Email Address
                </h3>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Email
                    </label>
                    <input
                      type="email"
                      value={currentEmail}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter new email address"
                      required
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Email Change Process:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>You'll receive a confirmation email at your new address</li>
                          <li>Click the confirmation link to complete the change</li>
                          <li>Your current email will remain active until confirmed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || newEmail === currentEmail}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </div>

              {/* Password Change Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-orange-500" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter new password"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Password must be at least 6 characters long
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-orange-500" />
                  Database Backup & Restore
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Export Backup */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Export Backup</h4>
                    <p className="text-sm text-gray-600">
                      Download a complete backup of your database including all events, gallery items, products, and settings.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      disabled={isLoading}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isLoading ? 'Exporting...' : 'Export Backup'}
                    </button>
                  </div>

                  {/* Import Backup */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Import Backup</h4>
                    <p className="text-sm text-gray-600">
                      Restore your database from a previously exported backup file. This will replace all current data.
                    </p>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Important:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Always create a backup before importing new data</li>
                        <li>Import will replace all existing data</li>
                        <li>Only import backup files from trusted sources</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-orange-500" />
                  Gallery Settings
                </h3>
                
                <form onSubmit={handleGalleryUrlUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Album URL
                    </label>
                    <input
                      type="url"
                      value={googlePhotosUrl}
                      onChange={(e) => setGooglePhotosUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your gallery album URL"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      This URL will be used for the "View More Photos" button in the gallery section. You can use any photo sharing service URL.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Supported platforms:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>Google Photos shared albums</li>
                          <li>Flickr photo sets</li>
                          <li>Instagram profiles or hashtags</li>
                          <li>Facebook photo albums</li>
                          <li>Any other photo sharing service</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Updating...' : 'Update Gallery URL'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;