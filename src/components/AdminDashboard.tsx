import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MessageSquare, 
  Image, 
  Package, 
  Star, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Settings,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  getEventRequests, 
  getContactMessages, 
  getGalleryItems, 
  getProducts, 
  getTestimonials,
  updateEventRequest,
  updateContactMessage,
  deleteEventRequest,
  deleteContactMessage,
  deleteGalleryItem,
  deleteProduct,
  deleteTestimonial
} from '../lib/database';
import { getLoginAttemptStats, startActivityMonitoring } from '../lib/auth';
import { EventDetailsModal } from './EventDetailsModal';
import { MessageDetailsModal } from './MessageDetailsModal';
import { AddItemModal } from './AddItemModal';
import { EditItemModal } from './EditItemModal';
import { ExportModal } from './ExportModal';
import AdminSettings from './AdminSettings';
import toast from 'react-hot-toast';
import type { EventRequest, ContactMessage, GalleryItem, Product, Testimonial } from '../types/supabase';

type TabType = 'overview' | 'events' | 'messages' | 'gallery' | 'products' | 'testimonials' | 'settings' | 'security';

interface SecurityStats {
  totalAttempts: number;
  failedAttempts: number;
  successfulAttempts: number;
  isLocked: boolean;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'gallery' | 'product' | 'testimonial'>('gallery');
  const [addType, setAddType] = useState<'gallery' | 'product' | 'testimonial'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ongoing' | 'completed'>('all');
  const [viewedFilter, setViewedFilter] = useState<'all' | 'viewed' | 'new'>('all');
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalAttempts: 0,
    failedAttempts: 0,
    successfulAttempts: 0,
    isLocked: false
  });

  useEffect(() => {
    loadData();
    startActivityMonitoring();
    updateSecurityStats();
    
    // Update security stats every 30 seconds
    const interval = setInterval(updateSecurityStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateSecurityStats = () => {
    const stats = getLoginAttemptStats();
    setSecurityStats(stats);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, messagesData, galleryData, productsData, testimonialsData] = await Promise.all([
        getEventRequests(),
        getContactMessages(),
        getGalleryItems(),
        getProducts(),
        getTestimonials()
      ]);
      
      setEvents(eventsData || []);
      setMessages(messagesData || []);
      setGallery(galleryData || []);
      setProducts(productsData || []);
      setTestimonials(testimonialsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: 'pending' | 'ongoing' | 'completed') => {
    try {
      await updateEventRequest(eventId, { status: newStatus });
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, status: newStatus } : event
      ));
      toast.success('Event status updated successfully');
    } catch (error) {
      console.error('Failed to update event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleMarkAsViewed = async (messageId: string) => {
    try {
      await updateContactMessage(messageId, { viewed: true });
      setMessages(prev => prev.map(message => 
        message.id === messageId ? { ...message, viewed: true } : message
      ));
      toast.success('Message marked as viewed');
    } catch (error) {
      console.error('Failed to mark message as viewed:', error);
      toast.error('Failed to mark message as viewed');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event request?')) return;
    
    try {
      await deleteEventRequest(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event request deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event request');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteContactMessage(messageId);
      setMessages(prev => prev.filter(message => message.id !== messageId));
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    
    try {
      await deleteGalleryItem(itemId);
      setGallery(prev => prev.filter(item => item.id !== itemId));
      toast.success('Gallery item deleted successfully');
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      toast.error('Failed to delete gallery item');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      await deleteTestimonial(testimonialId);
      setTestimonials(prev => prev.filter(testimonial => testimonial.id !== testimonialId));
      toast.success('Testimonial deleted successfully');
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const handleEdit = (item: any, type: 'gallery' | 'product' | 'testimonial') => {
    setEditItem(item);
    setEditType(type);
    setShowEditModal(true);
  };

  const handleAdd = (type: 'gallery' | 'product' | 'testimonial') => {
    setAddType(type);
    setShowAddModal(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesViewed = viewedFilter === 'all' || 
                         (viewedFilter === 'viewed' && message.viewed) ||
                         (viewedFilter === 'new' && !message.viewed);
    return matchesSearch && matchesViewed;
  });

  const stats = {
    totalEvents: events.length,
    pendingEvents: events.filter(e => e.status === 'pending').length,
    ongoingEvents: events.filter(e => e.status === 'ongoing').length,
    completedEvents: events.filter(e => e.status === 'completed').length,
    totalMessages: messages.length,
    newMessages: messages.filter(m => !m.viewed).length,
    galleryItems: gallery.length,
    products: products.length,
    testimonials: testimonials.length
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'events', label: 'Events', icon: Calendar, badge: stats.pendingEvents },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: stats.newMessages },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-orange-500" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      {tab.label}
                    </div>
                    {tab.badge && tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Events</p>
                          <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-500" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gray-800 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Pending Events</p>
                          <p className="text-2xl font-bold text-yellow-400">{stats.pendingEvents}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-800 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">New Messages</p>
                          <p className="text-2xl font-bold text-blue-400">{stats.newMessages}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gray-800 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Gallery Items</p>
                          <p className="text-2xl font-bold text-green-400">{stats.galleryItems}</p>
                        </div>
                        <Image className="w-8 h-8 text-green-500" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Events</h3>
                      <div className="space-y-4">
                        {events.slice(0, 5).map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{event.name}</p>
                              <p className="text-gray-400 text-sm">{event.event_type}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              event.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Messages</h3>
                      <div className="space-y-4">
                        {messages.slice(0, 5).map((message) => (
                          <div key={message.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{message.name}</p>
                              <p className="text-gray-400 text-sm truncate">{message.message.substring(0, 50)}...</p>
                            </div>
                            {!message.viewed && (
                              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Event Requests</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-white">{event.name}</div>
                                <div className="text-sm text-gray-400">{event.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">{event.event_type}</div>
                              <div className="text-sm text-gray-400">{event.guest_count} guests</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(event.event_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                event.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {event.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setShowEventModal(true);
                                  }}
                                  className="text-orange-500 hover:text-orange-400"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <select
                      value={viewedFilter}
                      onChange={(e) => setViewedFilter(e.target.value as any)}
                      className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Messages</option>
                      <option value="new">New Only</option>
                      <option value="viewed">Viewed Only</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sender</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredMessages.map((message) => (
                          <tr key={message.id} className="hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-white">{message.name}</div>
                                <div className="text-sm text-gray-400">{message.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-white truncate max-w-xs">
                                {message.message.substring(0, 100)}...
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(message.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                message.viewed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {message.viewed ? 'Viewed' : 'New'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    setShowMessageModal(true);
                                  }}
                                  className="text-orange-500 hover:text-orange-400"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Gallery Management</h2>
                  <button
                    onClick={() => handleAdd('gallery')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Gallery Item
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gallery.map((item) => (
                    <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                        <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item, 'gallery')}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Products Management</h2>
                  <button
                    onClick={() => handleAdd('product')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                        <p className="text-orange-500 font-bold text-lg mb-2">{product.price}</p>
                        <p className="text-gray-300 text-sm mb-4">{product.description}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product, 'product')}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Testimonials Management</h2>
                  <button
                    onClick={() => handleAdd('testimonial')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Testimonial
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-gray-800 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={testimonial.avatar_url}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                          <p className="text-gray-400 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">{testimonial.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(testimonial, 'testimonial')}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Security Dashboard</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Login Attempts</p>
                        <p className="text-2xl font-bold text-white">{securityStats.totalAttempts}</p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Failed Attempts</p>
                        <p className="text-2xl font-bold text-red-400">{securityStats.failedAttempts}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Successful Logins</p>
                        <p className="text-2xl font-bold text-green-400">{securityStats.successfulAttempts}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Account Status</p>
                        <p className={`text-2xl font-bold ${securityStats.isLocked ? 'text-red-400' : 'text-green-400'}`}>
                          {securityStats.isLocked ? 'Locked' : 'Active'}
                        </p>
                      </div>
                      <Shield className={`w-8 h-8 ${securityStats.isLocked ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Security Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">Rate Limiting (5 attempts/15min)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">Session Timeout (30 minutes)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">Input Validation & Sanitization</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">CSRF Protection</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">Secure Password Hashing</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">Activity Monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <AdminSettings />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onStatusChange={handleStatusChange}
      />

      <MessageDetailsModal
        message={selectedMessage}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onMarkAsViewed={handleMarkAsViewed}
      />

      <AddItemModal
        type={addType}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadData();
          setShowAddModal(false);
        }}
      />

      <EditItemModal
        type={editType}
        item={editItem}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          loadData();
          setShowEditModal(false);
        }}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        events={events}
        messages={messages}
      />
    </div>
  );
}