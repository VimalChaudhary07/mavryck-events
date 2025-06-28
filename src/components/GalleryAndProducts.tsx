import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Star, ArrowRight, ArrowLeft, ExternalLink, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGalleryItems, getProducts } from '../lib/database';
import type { GalleryItem, Product } from '../types/supabase';

const categories = ['All', 'Corporate', 'Wedding', 'Birthday', 'Festival', 'Gala', 'Anniversary'];

export function GalleryAndProducts() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [googlePhotosUrl, setGooglePhotosUrl] = useState('https://photos.google.com/share/your-album-link');
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Memoize filtered images to prevent unnecessary recalculations
  const filteredImages = useMemo(() => {
    return selectedCategory === 'All'
      ? galleryImages
      : galleryImages.filter(img => img.category === selectedCategory);
  }, [galleryImages, selectedCategory]);

  // Memoize animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }), []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [galleryData, productsData] = await Promise.all([
          getGalleryItems(),
          getProducts()
        ]);
        setGalleryImages(galleryData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Load Google Photos URL from settings
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.business?.contact?.googlePhotosUrl) {
          setGooglePhotosUrl(settings.business.contact.googlePhotosUrl);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  }, [filteredImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  }, [filteredImages.length]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentImageIndex(0);
  }, []);

  const handleImageClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  }, []);

  const handleViewMoreClick = useCallback(() => {
    window.open(googlePhotosUrl, '_blank', 'noopener,noreferrer');
  }, [googlePhotosUrl]);

  const handleImageLoad = useCallback((imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
  }, []);

  const handleImageLoadStart = useCallback((imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: true }));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading gallery and products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Products Section */}
        {products.length > 0 && (
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Packages</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Carefully curated event packages designed to make your special day perfect
              </p>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative h-64 overflow-hidden">
                    {imageLoadingStates[product.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Loader className="w-8 h-8 animate-spin text-orange-500" />
                      </div>
                    )}
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      onLoadStart={() => handleImageLoadStart(product.id)}
                      onLoad={() => handleImageLoad(product.id)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-orange-500">{product.price}</span>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                      >
                        Book Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Gallery Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Gallery</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Browse through our collection of successful events and celebrations
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {filteredImages.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="wait">
                  {filteredImages.map((image, index) => (
                    <motion.div
                      key={`${selectedCategory}-${image.id}`}
                      variants={itemVariants}
                      layout
                      onClick={() => handleImageClick(index)}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      {imageLoadingStates[image.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                          <Loader className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                      )}
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onLoadStart={() => handleImageLoadStart(image.id)}
                        onLoad={() => handleImageLoad(image.id)}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-xl font-bold text-white mb-1">{image.title}</h3>
                          <p className="text-orange-400 font-medium">{image.category}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* View More Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mt-12"
              >
                <motion.button
                  onClick={handleViewMoreClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  <span>View Complete Gallery</span>
                  <ExternalLink className="w-6 h-6" />
                </motion.button>
                <p className="text-gray-500 text-sm mt-3">
                  Explore our complete photo collection on Google Photos
                </p>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-8">
                {selectedCategory === 'All' 
                  ? 'No gallery items available yet.' 
                  : `No ${selectedCategory} events in gallery yet.`
                }
              </p>
              <motion.button
                onClick={handleViewMoreClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
              >
                <span>View Our Photo Collection</span>
                <ExternalLink className="w-6 h-6" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Optimized Lightbox */}
        <AnimatePresence>
          {showLightbox && filteredImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setShowLightbox(false)}
            >
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 text-white text-2xl p-2 hover:text-orange-500 z-10 bg-black/50 rounded-full"
              >
                ✕
              </button>
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="absolute left-4 text-white p-3 hover:text-orange-500 z-10 bg-black/50 rounded-full"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="absolute right-4 text-white p-3 hover:text-orange-500 z-10 bg-black/50 rounded-full"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}
              <div className="text-center max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                <motion.img
                  key={currentImageIndex}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={filteredImages[currentImageIndex].image_url}
                  alt={filteredImages[currentImageIndex].title}
                  className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
                />
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-white">
                    {filteredImages[currentImageIndex].title}
                  </h3>
                  <p className="text-orange-400">
                    {filteredImages[currentImageIndex].category}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}