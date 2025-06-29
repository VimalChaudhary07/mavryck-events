import React, { useState, useEffect } from 'react';
import { 
  updateUserPassword, 
  exportDatabaseBackup,
  importDatabaseBackup,
  updateGooglePhotosUrl,
  getGooglePhotosUrl
} from '../lib/auth';
import { 
  Lock, 
  Download, 
  Upload, 
  Camera, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database,
  Shield,
  Settings,
  User,
  Globe,
  Palette,
  Bell,
  Monitor,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googlePhotosUrl, setGooglePhotosUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
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
        toast.success('Password updated successfully!');
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
        event.target.value = '';
        toast.success('Database restored successfully!');
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

    // Validate URL format
    try {
      new URL(googlePhotosUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateGooglePhotosUrl(googlePhotosUrl);
      if (success) {
        toast.success('Gallery URL updated successfully!');
      }
    } catch (error) {
      console.error('Gallery URL update error:', error);
      toast.error('Failed to update Gallery URL');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'gallery', label: 'Gallery Settings', icon: Camera },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const renderProgressIndicator = (progress: BackupProgress | null, title: string) => {
    if (!progress) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {title}
          </h4>
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {progress.progress}%
          </span>
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-4 mb-4 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ width: `${progress.progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
          >
            {progress.progress > 15 && (
              <span className="text-xs text-white font-medium">{progress.progress}%</span>
            )}
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-blue-700">
            <Database className="w-4 h-4 mr-2" />
            <span className="font-medium">{progress.stage}</span>
          </div>
          
          {progress.currentTable && (
            <div className="flex items-center text-sm text-blue-600">
              <Monitor className="w-4 h-4 mr-2" />
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
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
                <p className="text-orange-100 mt-1">Manage your system configuration and preferences</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 font-medium text-sm flex items-center space-x-2 border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600 bg-white'
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
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <User className="w-6 h-6 text-orange-500" />
                    General Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Manage your basic account and system preferences</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        System Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <span className="font-medium">2.0.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Environment:</span>
                          <span className="font-medium">{import.meta.env.PROD ? 'Production' : 'Development'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-green-500" />
                        Quick Stats
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Sessions:</span>
                          <span className="font-medium">1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage Used:</span>
                          <span className="font-medium">~2.5 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Login:</span>
                          <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-orange-500" />
                    Security Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Manage your account security and authentication preferences</p>
                  
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-500" />
                      Change Password
                    </h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-12"
                            placeholder="Enter new password"
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-12"
                            placeholder="Confirm new password"
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                          <strong>Password Requirements:</strong> Minimum 6 characters. Use a strong, unique password.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Database className="w-6 h-6 text-orange-500" />
                    Backup & Restore
                  </h3>
                  <p className="text-gray-600 mb-6">Manage your database backups and restore operations</p>
                  
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-2">Backup includes the following sections:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <ul className="space-y-1">
                            <li>• Overview Statistics</li>
                            <li>• Event Requests</li>
                            <li>• Contact Messages</li>
                          </ul>
                          <ul className="space-y-1">
                            <li>• Gallery Items</li>
                            <li>• Products & Services</li>
                            <li>• Customer Testimonials</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {renderProgressIndicator(backupProgress, 'Export Progress')}
                  {renderProgressIndicator(restoreProgress, 'Import Progress')}
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Download className="w-5 h-5 text-green-500" />
                        Export Backup
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a complete backup of your database as an Excel file with formatted sheets.
                      </p>
                      <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
                        <h5 className="text-sm font-medium text-green-800 mb-2">Export Features:</h5>
                        <ul className="text-xs text-green-700 space-y-1">
                          <li>• Real-time progress tracking</li>
                          <li>• Formatted Excel sheets</li>
                          <li>• Metadata and statistics</li>
                          <li>• Color-coded status indicators</li>
                        </ul>
                      </div>
                      <button
                        onClick={handleExportBackup}
                        disabled={isLoading}
                        className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium gap-2 transition-all duration-200"
                      >
                        <Download className="w-4 h-4" />
                        {isLoading && backupProgress ? 'Exporting...' : 'Export Database Backup'}
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-500" />
                        Import Backup
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Restore your database from a previously exported XLSX backup file.
                      </p>
                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4">
                        <h5 className="text-sm font-medium text-blue-800 mb-2">Import Features:</h5>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Real-time progress updates</li>
                          <li>• Data validation and error handling</li>
                          <li>• Automatic data type conversion</li>
                          <li>• Safe restoration with rollback</li>
                        </ul>
                      </div>
                      <input
                        type="file"
                        accept=".xlsx"
                        onChange={handleImportBackup}
                        disabled={isLoading}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-2">Important Safety Notes:</p>
                        <ul className="space-y-1">
                          <li>• Always create a backup before importing new data</li>
                          <li>• Import will replace existing data in selected sections</li>
                          <li>• Only import backup files from trusted sources</li>
                          <li>• Large datasets may take several minutes to process</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Camera className="w-6 h-6 text-orange-500" />
                    Gallery Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Configure your gallery display and external photo album links</p>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <form onSubmit={handleGalleryUrlUpdate} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gallery Album URL
                        </label>
                        <input
                          type="url"
                          value={googlePhotosUrl}
                          onChange={(e) => setGooglePhotosUrl(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your gallery album URL"
                          required
                        />
                        <p className="mt-2 text-sm text-gray-600">
                          This URL will be used for the "View More Photos" button in the gallery section.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium mb-2">Supported platforms:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <ul className="space-y-1">
                                <li>• Google Photos shared albums</li>
                                <li>• Flickr photo sets</li>
                                <li>• Instagram profiles</li>
                              </ul>
                              <ul className="space-y-1">
                                <li>• Facebook photo albums</li>
                                <li>• Dropbox shared folders</li>
                                <li>• Any photo sharing service</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !googlePhotosUrl.trim()}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Updating...' : 'Update Gallery URL'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Palette className="w-6 h-6 text-orange-500" />
                    Appearance Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Customize the look and feel of your admin dashboard</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-indigo-500" />
                        Theme Preferences
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input type="radio" name="theme" value="dark" defaultChecked className="text-orange-500" />
                          <span className="font-medium">Dark Theme</span>
                          <span className="text-sm text-gray-500 ml-auto">Current</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors opacity-50">
                          <input type="radio" name="theme" value="light" disabled className="text-orange-500" />
                          <span className="font-medium">Light Theme</span>
                          <span className="text-sm text-gray-500 ml-auto">Coming Soon</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-green-500" />
                        Display Options
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span className="font-medium">Compact Mode</span>
                          <input type="checkbox" className="text-orange-500 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span className="font-medium">Show Animations</span>
                          <input type="checkbox" defaultChecked className="text-orange-500 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span className="font-medium">High Contrast</span>
                          <input type="checkbox" className="text-orange-500 rounded" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Bell className="w-6 h-6 text-orange-500" />
                    Notification Settings
                  </h3>
                  <p className="text-gray-600 mb-6">Configure how and when you receive notifications</p>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-500" />
                        Email Notifications
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">New Event Requests</span>
                            <p className="text-sm text-gray-500">Get notified when someone submits an event request</p>
                          </div>
                          <input type="checkbox" defaultChecked className="text-orange-500 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">Contact Messages</span>
                            <p className="text-sm text-gray-500">Get notified when someone sends a contact message</p>
                          </div>
                          <input type="checkbox" defaultChecked className="text-orange-500 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">System Updates</span>
                            <p className="text-sm text-gray-500">Get notified about system maintenance and updates</p>
                          </div>
                          <input type="checkbox" className="text-orange-500 rounded" />
                        </label>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-500" />
                        Browser Notifications
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">Desktop Notifications</span>
                            <p className="text-sm text-gray-500">Show browser notifications for important events</p>
                          </div>
                          <input type="checkbox" className="text-orange-500 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">Sound Alerts</span>
                            <p className="text-sm text-gray-500">Play sound when receiving notifications</p>
                          </div>
                          <input type="checkbox" className="text-orange-500 rounded" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;