import React, { useState, useEffect } from 'react';
import { Trash2, Settings, Calendar, MessageSquare, Image, Package, Star, Edit, Eye, Phone, Mail, Download, Filter, Search, Archive, MoreVertical, Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  getEventRequests, 
  getContactMessages, 
  getGalleryItems, 
  getProducts, 
  getTestimonials,
  deleteEventRequest,
  deleteContactMessage,
  deleteGalleryItem,
  deleteProduct,
  deleteTestimonial,
  updateEventRequest,
  updateContactMessage,
  testDatabaseConnection
} from '../lib/database';
import { getCurrentSession, refreshSession } from '../lib/auth';
import type { EventRequest, ContactMessage, GalleryItem, Product, Testimonial } from '../types/supabase';
import { AddItemModal } from './AddItemModal';
import { EditItemModal } from './EditItemModal';
import { EventDetailsModal } from './EventDetailsModal';
import { MessageDetailsModal } from './MessageDetailsModal';
import { AdminSettings } from './AdminSettings';
import { ExportModal } from './ExportModal';
import * as XLSX from 'xlsx';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'pending' | 'ongoing' | 'completed'>('all');
  const [messageFilter, setMessageFilter] = useState<'all' | 'new' | 'viewed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isMessageDetailsOpen, setIsMessageDetailsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'gallery' | 'product' | 'testimonial'>('gallery');
  const [editModalType, setEditModalType] = useState<'gallery' | 'product' | 'testimonial'>('gallery');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [refreshing, setRefreshing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setAuthStatus('checking');
      setConnectionStatus('checking');
      
      // Check authentication status
      const session = await getCurrentSession();
      if (session && session.user?.email === 'admin@mavryck_events') {
        setAuthStatus('authenticated');
        console.log('Admin authenticated successfully');
      } else {
        // Try to refresh session
        const refreshed = await refreshSession();
        if (refreshed) {
          setAuthStatus('authenticated');
          console.log('Session refreshed successfully');
        } else {
          setAuthStatus('unauthenticated');
          toast.error('Authentication required. Please log in again.');
          return;
        }
      }
      
      // Test database connection
      const isConnected = await testDatabaseConnection();
      if (isConnected) {
        setConnectionStatus('connected');
        await loadData();
      } else {
        setConnectionStatus('disconnected');
        toast.error('Database connection failed. Please check your connection.');
      }
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      setConnectionStatus('disconnected');
      setAuthStatus('unauthenticated');
      toast.error('Failed to initialize dashboard');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      const [eventsData, messagesData, galleryData, productsData, testimonialsData] = await Promise.all([
        getEventRequests().catch(err => {
          console.error('Failed to load events:', err);
          return [];
        }),
        getContactMessages().catch(err => {
          console.error('Failed to load messages:', err);
          return [];
        }),
        getGalleryItems().catch(err => {
          console.error('Failed to load gallery:', err);
          return [];
        }),
        getProducts().catch(err => {
          console.error('Failed to load products:', err);
          return [];
        }),
        getTestimonials().catch(err => {
          console.error('Failed to load testimonials:', err);
          return [];
        })
      ]);
      
      setEvents(eventsData || []);
      setMessages(messagesData || []);
      setGalleryItems(galleryData || []);
      setProducts(productsData || []);
      setTestimonials(testimonialsData || []);
      
      console.log('Dashboard data loaded successfully:', {
        events: eventsData?.length || 0,
        messages: messagesData?.length || 0,
        gallery: galleryData?.length || 0,
        products: productsData?.length || 0,
        testimonials: testimonialsData?.length || 0
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data. Please check your authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  // Bulk delete functionality
  const handleBulkDelete = async (type: 'events' | 'messages') => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedItems.length} ${type}? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const deletePromises = selectedItems.map(id => 
        type === 'events' ? deleteEventRequest(id) : deleteContactMessage(id)
      );
      
      await Promise.all(deletePromises);
      toast.success(`${selectedItems.length} ${type} deleted successfully`);
      setSelectedItems([]);
      loadData();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      toast.error(`Failed to delete ${type}. Please check your authentication.`);
    }
  };

  // Quick export functionality
  const handleQuickExport = (type: 'events' | 'messages') => {
    try {
      const data = type === 'events' ? filteredEvents : filteredMessages;
      
      if (data.length === 0) {
        toast.error(`No ${type} to export`);
        return;
      }

      const workbook = XLSX.utils.book_new();
      
      if (type === 'events') {
        const eventsData = data.map(event => ({
          ID: event.id,
          Name: event.name,
          Email: event.email,
          Phone: event.phone,
          'Event Type': event.event_type,
          'Event Date': new Date(event.event_date).toLocaleDateString(),
          'Guest Count': event.guest_count,
          Requirements: event.requirements,
          Status: event.status,
          'Created At': new Date(event.created_at).toLocaleString()
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(eventsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Event Requests');
      } else {
        const messagesData = data.map(message => ({
          ID: message.id,
          Name: message.name,
          Email: message.email,
          Message: message.message,
          Viewed: message.viewed ? 'Yes' : 'No',
          'Created At': new Date(message.created_at).toLocaleString()
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(messagesData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Messages');
      }

      const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success(`${type} exported successfully`);
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
      toast.error(`Failed to export ${type}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      await deleteEventRequest(eventId);
      toast.success('Event deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event. Please check your authentication.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) return;
    
    try {
      await deleteContactMessage(messageId);
      toast.success('Message deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message. Please check your authentication.');
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) return;
    
    try {
      await deleteGalleryItem(itemId);
      toast.success('Gallery item deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      toast.error('Failed to delete gallery item. Please check your authentication.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product. Please check your authentication.');
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) return;
    
    try {
      await deleteTestimonial(testimonialId);
      toast.success('Testimonial deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      toast.error('Failed to delete testimonial. Please check your authentication.');
    }
  };

  const handleEventStatusChange = async (eventId: string, newStatus: 'pending' | 'ongoing' | 'completed') => {
    try {
      const event = events.find(e => e.id === eventId);
      if (event) {
        await updateEventRequest(eventId, { status: newStatus });
        toast.success('Event status updated successfully');
        loadData();
        setSelectedEvent(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
      toast.error('Failed to update event status. Please check your authentication.');
    }
  };

  const handleMarkMessageAsViewed = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        await updateContactMessage(messageId, { viewed: true });
        toast.success('Message marked as viewed');
        loadData();
        setSelectedMessage(prev => prev ? { ...prev, viewed: true } : null);
      }
    } catch (error) {
      console.error('Failed to mark message as viewed:', error);
      toast.error('Failed to update message status. Please check your authentication.');
    }
  };

  const handleAddModalOpen = (type: 'gallery' | 'product' | 'testimonial') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const handleEditModalOpen = (type: 'gallery' | 'product' | 'testimonial', item: any) => {
    setEditModalType(type);
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleEventClick = (event: EventRequest) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsMessageDetailsOpen(true);
  };

  // Helper function to ensure valid rating for star rendering
  const getValidRating = (rating: number): number => {
    return Math.max(1, Math.min(5, Math.floor(rating) || 1));
  };

  // Filter and search functionality
  const filteredEvents = events.filter(event => {
    const matchesStatus = eventStatusFilter === 'all' || event.status === eventStatusFilter;
    const matchesSearch = searchTerm === '' || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredMessages = messages.filter(message => {
    const matchesFilter = messageFilter === 'all' || 
      (messageFilter === 'new' && !message.viewed) ||
      (messageFilter === 'viewed' && message.viewed);
    const matchesSearch = searchTerm === '' ||
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Count events by status
  const eventCounts = {
    pending: events.filter(e => e.status === 'pending').length,
    ongoing: events.filter(e => e.status === 'ongoing').length,
    completed: events.filter(e => e.status === 'completed').length,
  };

  // Count messages by status
  const messageCounts = {
    new: messages.filter(m => !m.viewed).length,
    viewed: messages.filter(m => m.viewed).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'ongoing': return 'text-blue-400 bg-blue-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New Request';
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (loading && (connectionStatus === 'checking' || authStatus === 'checking')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to access the admin dashboard.</p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with Connection Status */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              {/* Auth Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                authStatus === 'authenticated' 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {authStatus === 'authenticated' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="capitalize">{authStatus}</span>
              </div>
              
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500/10 text-green-400' 
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : connectionStatus === 'disconnected' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                )}
                <span className="capitalize">{connectionStatus}</span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
          <p className="text-gray-400">Manage your events, messages, and content</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-2">
            <div className="bg-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-white font-semibold mb-3">Navigation</h3>
              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === 'events'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Events ({events.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === 'messages'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages ({messages.length})</span>
                {messageCounts.new > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                    {messageCounts.new}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === 'gallery'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Image className="w-5 h-5" />
                <span>Gallery ({galleryItems.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === 'products'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Products ({products.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === 'testimonials'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Testimonials ({testimonials.length})</span>
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
              <button
                onClick={() => handleAddModalOpen('gallery')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 text-left"
              >
                <Plus className="w-5 h-5" />
                <span>Add Gallery Item</span>
              </button>
              <button
                onClick={() => handleAddModalOpen('product')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 text-left"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
              <button
                onClick={() => handleAddModalOpen('testimonial')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 text-left"
              >
                <Plus className="w-5 h-5" />
                <span>Add Testimonial</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'events' && (
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-white">Event Requests</h2>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickExport('events')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      
                      {selectedItems.length > 0 && (
                        <button
                          onClick={() => handleBulkDelete('events')}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete ({selectedItems.length})</span>
                          <span className="sm:hidden">({selectedItems.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  <button
                    onClick={() => setEventStatusFilter('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      eventStatusFilter === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    All ({events.length})
                  </button>
                  <button
                    onClick={() => setEventStatusFilter('pending')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      eventStatusFilter === 'pending'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    New ({eventCounts.pending})
                  </button>
                  <button
                    onClick={() => setEventStatusFilter('ongoing')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      eventStatusFilter === 'ongoing'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Ongoing ({eventCounts.ongoing})
                  </button>
                  <button
                    onClick={() => setEventStatusFilter('completed')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      eventStatusFilter === 'completed'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Completed ({eventCounts.completed})
                  </button>
                </div>

                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(event.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...prev, event.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== event.id));
                              }
                            }}
                            className="mt-1 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-lg font-medium text-white truncate">{event.name}</h3>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                {getStatusLabel(event.status)}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm">
                              <div className="truncate">
                                <span className="text-gray-400">Email: </span>
                                <span className="text-gray-300">{event.email}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Phone: </span>
                                <span className="text-gray-300">{event.phone}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Event: </span>
                                <span className="text-orange-500 capitalize">{event.event_type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleEventClick(event)}
                            className="text-blue-500 hover:text-blue-400 p-2"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <a
                            href={`tel:${event.phone}`}
                            className="text-green-500 hover:text-green-400 p-2"
                            title="Call"
                          >
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          </a>
                          <a
                            href={`mailto:${event.email}`}
                            className="text-orange-500 hover:text-orange-400 p-2"
                            title="Email"
                          >
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                          </a>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-500 hover:text-red-400 p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredEvents.length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      No {eventStatusFilter === 'all' ? '' : eventStatusFilter} events found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-white">Contact Messages</h2>
                  
                  {/* Search and Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickExport('messages')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      
                      {selectedItems.length > 0 && (
                        <button
                          onClick={() => handleBulkDelete('messages')}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete ({selectedItems.length})</span>
                          <span className="sm:hidden">({selectedItems.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Filter Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  <button
                    onClick={() => setMessageFilter('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      messageFilter === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    All ({messages.length})
                  </button>
                  <button
                    onClick={() => setMessageFilter('new')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      messageFilter === 'new'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    New ({messageCounts.new})
                    {messageCounts.new > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {messageCounts.new}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setMessageFilter('viewed')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      messageFilter === 'viewed'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Viewed ({messageCounts.viewed})
                  </button>
                </div>

                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(message.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...prev, message.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== message.id));
                              }
                            }}
                            className="mt-1 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-lg font-medium text-white truncate">{message.name}</h3>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                message.viewed 
                                  ? 'text-green-400 bg-green-400/10' 
                                  : 'text-yellow-400 bg-yellow-400/10'
                              }`}>
                                {message.viewed ? 'Viewed' : 'New'}
                              </div>
                            </div>
                            <p className="text-gray-400 mb-2 text-sm truncate">{message.email}</p>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {message.message.length > 100 
                                ? `${message.message.substring(0, 100)}...` 
                                : message.message
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleMessageClick(message)}
                            className="text-blue-500 hover:text-blue-400 p-2"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <a
                            href={`mailto:${message.email}`}
                            className="text-orange-500 hover:text-orange-400 p-2"
                            title="Reply"
                          >
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                          </a>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-500 hover:text-red-400 p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredMessages.length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      No {messageFilter === 'all' ? '' : messageFilter} messages found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Gallery Items</h2>
                  <button
                    onClick={() => handleAddModalOpen('gallery')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Item</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-white font-medium truncate">{item.title}</h3>
                        <p className="text-orange-500 text-sm">{item.category}</p>
                        {item.description && (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEditModalOpen('gallery', item)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {galleryItems.length === 0 && (
                    <div className="col-span-full text-gray-400 text-center py-8">
                      No gallery items yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Products</h2>
                  <button
                    onClick={() => handleAddModalOpen('product')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Product</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-white font-medium truncate">{product.name}</h3>
                        <p className="text-orange-500 font-bold">{product.price}</p>
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{product.description}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEditModalOpen('product', product)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {products.length === 0 && (
                    <div className="col-span-full text-gray-400 text-center py-8">
                      No products yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Testimonials</h2>
                  <button
                    onClick={() => handleAddModalOpen('testimonial')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Testimonial</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4 flex-1">
                          <img
                            src={testimonial.avatar_url}
                            alt={testimonial.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-medium">{testimonial.name}</h3>
                            <p className="text-orange-500 text-sm">{testimonial.role}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(getValidRating(testimonial.rating))].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <p className="text-gray-400 text-sm mt-2 line-clamp-3">{testimonial.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleEditModalOpen('testimonial', testimonial)}
                            className="text-blue-500 hover:text-blue-400 p-2"
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                            className="text-red-500 hover:text-red-400 p-2"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {testimonials.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No testimonials yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </div>

      <AddItemModal
        type={addModalType}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />

      <EditItemModal
        type={editModalType}
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
      />

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isEventDetailsOpen}
        onClose={() => {
          setIsEventDetailsOpen(false);
          setSelectedEvent(null);
        }}
        onStatusChange={handleEventStatusChange}
      />

      <MessageDetailsModal
        message={selectedMessage}
        isOpen={isMessageDetailsOpen}
        onClose={() => {
          setIsMessageDetailsOpen(false);
          setSelectedMessage(null);
        }}
        onMarkAsViewed={handleMarkMessageAsViewed}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        events={events}
        messages={messages}
      />
    </div>
  );
}