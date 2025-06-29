import { X, Calendar, Users, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { EventRequest } from '../types/supabase';

interface EventDetailsModalProps {
  event: EventRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (eventId: string, newStatus: 'pending' | 'ongoing' | 'completed') => void;
}

export function EventDetailsModal({ event, isOpen, onClose, onStatusChange }: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Event Details</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                <Clock className="w-4 h-4 mr-1" />
                {getStatusLabel(event.status)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Information */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <p className="text-white">{event.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <a href={`mailto:${event.email}`} className="text-orange-500 hover:text-orange-400 transition-colors">
                  {event.email}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <a href={`tel:${event.phone}`} className="text-orange-500 hover:text-orange-400 transition-colors">
                  {event.phone}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Guest Count</label>
                <p className="text-white">{event.guest_count}</p>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Event Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
                <p className="text-white capitalize">{event.event_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Event Date</label>
                <p className="text-white">{new Date(event.event_date).toLocaleDateString()}</p>
              </div>
            </div>
            {event.requirements && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Special Requirements</label>
                <p className="text-white bg-gray-600/50 rounded p-3">{event.requirements}</p>
              </div>
            )}
          </div>

          {/* Status Management */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Status Management
            </h3>
            <div className="flex gap-2 flex-wrap">
              {['pending', 'ongoing', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(event.id, status as 'pending' | 'ongoing' | 'completed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    event.status === status
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Submission Date */}
          {event.created_at && (
            <div className="text-sm text-gray-400">
              Submitted on: {new Date(event.created_at).toLocaleString()}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}