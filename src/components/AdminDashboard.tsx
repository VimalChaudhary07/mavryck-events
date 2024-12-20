import React, { useState, useEffect } from 'react';
import { Trash2, Settings, Calendar, MessageSquare, Image, Package, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAll, remove } from '../lib/db';
import { AddItemModal } from './AddItemModal';
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
  status: 'pending' | 'completed';
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'gallery' | 'product' | 'testimonial'>('gallery');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, messagesData] = await Promise.all([
        getAll<Event>('event_requests'),
        getAll<Message>('contact_messages')
      ]);
      setEvents(eventsData || []);
      setMessages(messagesData || []);
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

  const handleAddModalOpen = (type: 'gallery' | 'product' | 'testimonial') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
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
              Events
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
              Messages
            </button>
            <button
              onClick={() => handleAddModalOpen('gallery')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700`}
            >
              <Image className="w-5 h-5" />
              Add to Gallery
            </button>
            <button
              onClick={() => handleAddModalOpen('product')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700`}
            >
              <Package className="w-5 h-5" />
              Add Product
            </button>
            <button
              onClick={() => handleAddModalOpen('testimonial')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700`}
            >
              <Star className="w-5 h-5" />
              Add Testimonial
            </button>
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
                <h2 className="text-xl font-semibold text-white mb-6">Event Requests</h2>
                <div className="space-y-4">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-white">{event.name}</h3>
                          <p className="text-gray-400">{event.email}</p>
                          <p className="text-gray-400">{event.phone}</p>
                          <p className="text-orange-500 mt-2">
                            {event.eventType} - {event.date}
                          </p>
                          <p className="text-gray-300 mt-2">
                            Guests: {event.guestCount}
                          </p>
                          {event.requirements && (
                            <p className="text-gray-400 mt-2">{event.requirements}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Contact Messages</h2>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-white">{message.name}</h3>
                          <p className="text-gray-400">{message.email}</p>
                          <p className="text-gray-300 mt-2">{message.message}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
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
    </div>
  );
}