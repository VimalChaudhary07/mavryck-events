import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { createGalleryItem, createProduct, createTestimonial } from '../lib/database';
import toast from 'react-hot-toast';

interface AddItemModalProps {
  type: 'gallery' | 'product' | 'testimonial';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddItemModal({ type, isOpen, onClose, onSuccess }: AddItemModalProps) {
  const [formData, setFormData] = useState<any>({});

  // Reset form data when type changes
  useEffect(() => {
    switch (type) {
      case 'gallery':
        setFormData({
          title: '',
          image_url: '',
          description: '',
          category: 'Corporate'
        });
        break;
      case 'product':
        setFormData({
          name: '',
          description: '',
          price: '',
          image_url: ''
        });
        break;
      case 'testimonial':
        setFormData({
          name: '',
          role: '',
          content: '',
          rating: 5,
          avatar_url: ''
        });
        break;
      default:
        setFormData({});
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type === 'gallery') {
        await createGalleryItem(formData);
      } else if (type === 'product') {
        await createProduct(formData);
      } else if (type === 'testimonial') {
        await createTestimonial(formData);
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
      onSuccess();
      onClose();
      
      // Reset form data after successful submission
      switch (type) {
        case 'gallery':
          setFormData({
            title: '',
            image_url: '',
            description: '',
            category: 'Corporate'
          });
          break;
        case 'product':
          setFormData({
            name: '',
            description: '',
            price: '',
            image_url: ''
          });
          break;
        case 'testimonial':
          setFormData({
            name: '',
            role: '',
            content: '',
            rating: 5,
            avatar_url: ''
          });
          break;
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error(`Failed to add ${type}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ 
      ...prev, 
      [id]: id === 'rating' ? parseInt(value) : value 
    }));
  };

  if (!isOpen) return null;

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
        className="bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Add New {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'gallery' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  id="category"
                  value={formData.category || 'Corporate'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="Corporate">Corporate</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Festival">Festival</option>
                  <option value="Gala">Gala</option>
                  <option value="Anniversary">Anniversary</option>
                </select>
              </div>
            </>
          )}

          {type === 'product' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                <input
                  type="text"
                  id="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  placeholder="e.g., ₹50,000"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </>
          )}

          {type === 'testimonial' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <input
                  type="text"
                  id="role"
                  value={formData.role || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                <select
                  id="rating"
                  value={formData.rating || 5}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {type === 'testimonial' ? 'Avatar URL' : 'Image URL'}
            </label>
            <input
              type="url"
              id={type === 'testimonial' ? 'avatar_url' : 'image_url'}
              value={formData[type === 'testimonial' ? 'avatar_url' : 'image_url'] || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {type === 'testimonial' ? 'Testimonial Content' : 'Description'}
            </label>
            <textarea
              id={type === 'testimonial' ? 'content' : 'description'}
              value={formData[type === 'testimonial' ? 'content' : 'description'] || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}