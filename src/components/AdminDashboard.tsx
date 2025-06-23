import React, { useState, useEffect } from 'react';
import { Trash2, Settings, Calendar, MessageSquare, Image, Package, Star, Edit, Eye, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAll, remove, update } from '../lib/db';
import { AddItemModal } from './AddItemModal';
import { EditItemModal } from './EditItemModal';
import { EventDetailsModal } from './EventDetailsModal';
import { MessageDetailsModal } from './MessageDetailsModal';
import { AdminSettings } from './AdminSettings';

interface Event {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  guestCount: string;
  requirements: string;
  status: 'pending' | 'ongoing' | 'completed';
  created_at?: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at?: string;
  viewed?: boolean;
}

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'pending' | 'ongoing' | 'completed'>('all');
  const [messageFilter, setMessageFilter] = useState<'all' | 'new' | 'viewed'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isMessageDetailsOpen, setIsMessageDetailsOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'gallery' | 'product' | 'testimonial'>('gallery');
  const [editModalType, setEditModalType] = useState<'gallery' | 'product' | 'testimonial'>('gallery');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, messagesData, galleryData, productsData, testimonialsData] = await Promise.all([
        getAll<Event>('event_requests'),
        getAll<Message>('contact_messages'),
        getAll<GalleryItem>('gallery'),
        getAll<Product>('products'),
        getAll<Testimonial>('testimonials')
      ]);
      setEvents(eventsData || []);
      setMessages(messagesData || []);
      setGalleryItems(galleryData || []);
      setProducts(productsData || []);
      setTestimonials(testimonialsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await remove('event_requests', eventId);
      toast.success('Event deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await remove('contact_messages', messageId);
      toast.success('Message deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    try {
      await remove('gallery', itemId);
      toast.success('Gallery item deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      toast.error('Failed to delete gallery item');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await remove('products', productId);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    try {
      await remove('testimonials', testimonialId);
      toast.success('Testimonial deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const handleEventStatusChange = async (eventId: string, newStatus: 'pending' | 'ongoing' | 'completed') => {
    try {
      const event = events.find(e => e.id === eventId);
      if (event) {
        await update('event_requests', eventId, { ...event, status: newStatus });
        toast.success('Event status updated successfully');
        loadData();
        setSelectedEvent(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleMarkMessageAsViewed = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        await update('contact_messages', messageId, { ...message, viewed: true });
        toast.success('Message marked as viewed');
        loadData();
        setSelectedMessage(prev => prev ? { ...prev, viewed: true } : null);
      }
    } catch (error) {
      console.error('Failed to mark message as viewed:', error);
      toast.error('Failed to update message status');
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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setIsMessageDetailsOpen(true);
  };

  // Helper function to ensure valid rating for star rendering
  const getValidRating = (rating: number): number => {
    return Math.max(1, Math.min(5, Math.floor(rating) || 1));
  };

  // Filter events by status
  const filteredEvents = eventStatusFilter === 'all' 
    ? events 
    : events.filter(event => event.status === eventStatusFilter);

  // Filter messages by viewed status
  const filteredMessages = messageFilter === 'all' 
    ? messages 
    : messageFilter === 'new' 
      ? messages.filter(message => !message.viewed)
      : messages.filter(message => message.viewed);

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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'events'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'messages'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Messages ({messages.length})
              {messageCounts.new > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {messageCounts.new}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Image className="w-5 h-5" />
              Gallery ({galleryItems.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'products'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Package className="w-5 h-5" />
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'testimonials'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Star className="w-5 h-5" />
              Testimonials ({testimonials.length})
            </button>
            <div className="border-t border-gray-700 pt-2">
              <button
                onClick={() => handleAddModalOpen('gallery')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                <Image className="w-5 h-5" />
                Add to Gallery
              </button>
              <button
                onClick={() => handleAddModalOpen('product')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                <Package className="w-5 h-5" />
                Add Product
              </button>
              <button
                onClick={() => handleAddModalOpen('testimonial')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                <Star className="w-5 h-5" />
                Add Testimonial
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
              Settings
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'events' && (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Event Requests</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEventStatusFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        eventStatusFilter === 'all'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      All ({events.length})
                    </button>
                    <button
                      onClick={() => setEventStatusFilter('pending')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        eventStatusFilter === 'pending'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      New ({eventCounts.pending})
                    </button>
                    <button
                      onClick={() => setEventStatusFilter('ongoing')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        eventStatusFilter === 'ongoing'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Ongoing ({eventCounts.ongoing})
                    </button>
                    <button
                      onClick={() => setEventStatusFilter('completed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        eventStatusFilter === 'completed'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Completed ({eventCounts.completed})
                    </button>
                  </div>
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
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-white">{event.name}</h3>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusLabel(event.status)}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Email: </span>
                              <span className="text-gray-300">{event.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Phone: </span>
                              <span className="text-gray-300">{event.phone}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Event: </span>
                              <span className="text-orange-500 capitalize">{event.eventType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEventClick(event)}
                            className="text-blue-500 hover:text-blue-400 p-2"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <a
                            href={`tel:${event.phone}`}
                            className="text-green-500 hover:text-green-400 p-2"
                            title="Call"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                          <a
                            href={`mailto:${event.email}`}
                            className="text-orange-500 hover:text-orange-400 p-2"
                            title="Email"
                          >
                            <Mail className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-500 hover:text-red-400 p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
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
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Contact Messages</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMessageFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        messageFilter === 'all'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      All ({messages.length})
                    </button>
                    <button
                      onClick={() => setMessageFilter('new')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        messageFilter === 'viewed'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Viewed ({messageCounts.viewed})
                    </button>
                  </div>
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
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-white">{message.name}</h3>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              message.viewed 
                                ? 'text-green-400 bg-green-400/10' 
                                : 'text-yellow-400 bg-yellow-400/10'
                            }`}>
                              {message.viewed ? 'Viewed' : 'New'}
                            </div>
                          </div>
                          <p className="text-gray-400 mb-2">{message.email}</p>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {message.message.length > 100 
                              ? `${message.message.substring(0, 100)}...` 
                              : message.message
                            }
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleMessageClick(message)}
                            className="text-blue-500 hover:text-blue-400 p-2"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <a
                            href={`mailto:${message.email}`}
                            className="text-orange-500 hover:text-orange-400 p-2"
                            title="Reply"
                          >
                            <Mail className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-500 hover:text-red-400 p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
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
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Gallery Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <p className="text-orange-500 text-sm">{item.category}</p>
                        {item.description && (
                          <p className="text-gray-400 text-sm mt-2">{item.description}</p>
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
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <h3 className="text-white font-medium">{product.name}</h3>
                        <p className="text-orange-500 font-bold">{product.price}</p>
                        <p className="text-gray-400 text-sm mt-2">{product.description}</p>
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
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Testimonials</h2>
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <img
                            src={testimonial.avatar_url}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-white font-medium">{testimonial.name}</h3>
                            <p className="text-orange-500 text-sm">{testimonial.role}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(getValidRating(testimonial.rating))].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <p className="text-gray-400 text-sm mt-2">{testimonial.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditModalOpen('testimonial', testimonial)}
                            className="text-blue-500 hover:text-blue-400 p-2"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                            className="text-red-500 hover:text-red-400 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
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
    </div>
  );
}