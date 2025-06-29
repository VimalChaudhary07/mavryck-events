import React, { useState, useEffect } from 'react';
import { 
  updateUserPassword, 
  exportDatabaseBackup,
  importDatabaseBackup,
  updateGooglePhotosUrl,
  getGooglePhotosUrl
} from '../lib/auth';
import { Lock, Download, Upload, Camera, Save, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';
import toast from 'react-hot-toast';

interface BackupProgress {
  stage: string;
  progress: number;
  total: number;
  currentTable?: string;
  recordsProcessed?: number;
  totalRecords?: number;
}

const AdminSettings: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googlePhotosUrl, setGooglePhotosUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('backup');
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<BackupProgress | null>(null);

  useEffect(() => {
    loadGooglePhotosUrl();
  }, []);

  const loadGooglePhotosUrl = async () => {
    try {
      const url = await getGooglePhotosUrl();
      setGooglePhotosUrl(url);
    } catch (error) {
      console.error('Error loading Google Photos URL:', error);
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
    setBackupProgress({ stage: 'Initializing...', progress: 0, total: 100 });
    
    try {
      await exportDatabaseBackup((progress, status, details) => {
        setBackupProgress({
          stage: status,
          progress: progress,
          total: 100,
          currentTable: details?.currentTable,
          recordsProcessed: details?.recordsProcessed,
          totalRecords: details?.totalRecords
        });
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export backup');
      setBackupProgress({ stage: 'Backup failed', progress: 0, total: 100 });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setBackupProgress(null);
      }, 3000);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error('Please select a valid XLSX backup file');
      return;
    }

    setIsLoading(true);
    setRestoreProgress({ stage: 'Reading file...', progress: 0, total: 100 });
    
    try {
      const success = await importDatabaseBackup(file, (progress, status, details) => {
        setRestoreProgress({
          stage: status,
          progress: progress,
          total: 100,
          currentTable: details?.currentTable,
          recordsProcessed: details?.recordsProcessed,
          totalRecords: details?.totalRecords
        });
      });
      
      if (success) {
        // Reset file input
        event.target.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import backup');
      setRestoreProgress({ stage: 'Import failed', progress: 0, total: 100 });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setRestoreProgress(null);
      }, 3000);
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
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'security', label: 'Security Settings', icon: Lock },
    { id: 'gallery', label: 'Gallery Settings', icon: Camera }
  ];

  const renderProgressIndicator = (progress: BackupProgress | null, title: string) => {
    if (!progress) return null;

    return (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-blue-900">{title}</h4>
          <span className="text-sm text-blue-600">{progress.progress}%</span>
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-center"
            style={{ width: `${progress.progress}%` }}
          >
            {progress.progress > 10 && (
              <span className="text-xs text-white font-medium">{progress.progress}%</span>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-blue-700">
            <Clock className="w-4 h-4 mr-2" />
            <span>{progress.stage}</span>
          </div>
          
          {progress.currentTable && (
            <div className="flex items-center text-sm text-blue-600">
              <Database className="w-4 h-4 mr-2" />
              <span>Processing: {progress.currentTable}</span>
            </div>
          )}
          
          {progress.recordsProcessed !== undefined && progress.totalRecords !== undefined && (
            <div className="flex items-center text-sm text-blue-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Records: {progress.recordsProcessed} / {progress.totalRecords}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          <p className="text-orange-100 mt-1">Manage your system settings and data</p>
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
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-orange-500" />
                  Enhanced Database Backup & Restore
                </h3>
                
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Backup includes the following sections:</p>
                      <ul className="mt-2 grid grid-cols-2 gap-1 list-disc list-inside">
                        <li>Overview Statistics</li>
                        <li>Event Requests</li>
                        <li>Contact Messages</li>
                        <li>Gallery Items</li>
                        <li>Products & Services</li>
                        <li>Customer Testimonials</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Export Progress */}
                {renderProgressIndicator(backupProgress, 'Export Progress')}
                
                {/* Import Progress */}
                {renderProgressIndicator(restoreProgress, 'Import Progress')}
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Export Backup */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Download className="w-4 h-4 mr-2 text-green-500" />
                      Export Backup
                    </h4>
                    <p className="text-sm text-gray-600">
                      Download a complete backup of your database as an Excel file with formatted sheets for each data section.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <h5 className="text-sm font-medium text-green-800 mb-2">Export Features:</h5>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Real-time progress tracking</li>
                        <li>• Formatted Excel sheets with auto-sized columns</li>
                        <li>• Metadata and statistics included</li>
                        <li>• Color-coded status indicators</li>
                        <li>• Optimized for viewing and analysis</li>
                      </ul>
                    </div>
                    <button
                      onClick={handleExportBackup}
                      disabled={isLoading}
                      className="w-full bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isLoading && backupProgress ? 'Exporting...' : 'Export Database Backup'}
                    </button>
                  </div>

                  {/* Import Backup */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Upload className="w-4 h-4 mr-2 text-blue-500" />
                      Import Backup
                    </h4>
                    <p className="text-sm text-gray-600">
                      Restore your database from a previously exported XLSX backup file with intelligent data validation.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">Import Features:</h5>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Real-time progress with table-by-table updates</li>
                        <li>• Data validation and error handling</li>
                        <li>• Automatic data type conversion</li>
                        <li>• Detailed error reporting</li>
                        <li>• Safe restoration with rollback on errors</li>
                      </ul>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsx"
                        onChange={handleImportBackup}
                        disabled={isLoading}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Important Safety Notes:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Export creates a comprehensive Excel file with all data sections</li>
                        <li>Always create a backup before importing new data</li>
                        <li>Import will replace existing data in the selected sections</li>
                        <li>Only import backup files from trusted sources</li>
                        <li>Large datasets may take several minutes to process</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
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