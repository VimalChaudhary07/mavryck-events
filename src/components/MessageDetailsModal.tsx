import { X, User, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ContactMessage } from '../types/supabase';

interface MessageDetailsModalProps {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsViewed: (messageId: string) => void;
}

export function MessageDetailsModal({ message, isOpen, onClose, onMarkAsViewed }: MessageDetailsModalProps) {
  if (!isOpen || !message) return null;

  const handleMarkAsViewed = () => {
    if (!message.viewed) {
      onMarkAsViewed(message.id);
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
              <h2 className="text-xl font-semibold text-white mb-2">Message Details</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                message.viewed 
                  ? 'text-green-400 bg-green-400/10' 
                  : 'text-yellow-400 bg-yellow-400/10'
              }`}>
                <MessageSquare className="w-4 h-4 mr-1" />
                {message.viewed ? 'Viewed' : 'New Message'}
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
          {/* Sender Information */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Sender Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <p className="text-white">{message.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <a href={`mailto:${message.email}`} className="text-orange-500 hover:text-orange-400 transition-colors">
                  {message.email}
                </a>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Message Content
            </h3>
            <div className="bg-gray-600/50 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Submission Date */}
          {message.created_at && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Received on: {new Date(message.created_at).toLocaleString()}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-between">
            <div>
              {!message.viewed && (
                <button
                  onClick={handleMarkAsViewed}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Mark as Viewed
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <a
                href={`mailto:${message.email}`}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Reply via Email
              </a>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}