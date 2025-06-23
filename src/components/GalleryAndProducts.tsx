import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { getAll } from '../lib/db';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image_url: string;
}

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  description?: string;
}

const categories = ['All', 'Corporate', 'Wedding', 'Birthday', 'Festival', 'Gala', 'Anniversary'];

export function GalleryAndProducts() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [galleryData, productsData] = await Promise.all([
          getAll<GalleryItem>('gallery'),
          getAll<Product>('products')
        ]);
        setGalleryImages(galleryData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  const filteredImages = selectedCategory === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentImageIndex(0); // Reset to first image when category changes
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Products Section */}
        {products.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Our Products</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Enhance your events with our premium services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-700"
                >
                  <div className="h-64 overflow-hidden relative group">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 mb-6">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-orange-500">{product.price}</span>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Section */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Event Gallery</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Browse through our collection of successful events
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(index)}
                  className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer"
                >
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-semibold text-white">{image.title}</h3>
                      <p className="text-orange-500">{image.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {selectedCategory === 'All' 
                  ? 'No gallery items available yet.' 
                  : `No ${selectedCategory} events in gallery yet.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Lightbox */}
        {showLightbox && filteredImages.length > 0 && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 text-white text-xl p-2 hover:text-orange-500"
            >
              ✕
            </button>
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 text-white p-2 hover:text-orange-500"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 text-white p-2 hover:text-orange-500"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div className="text-center">
              <img
                src={filteredImages[currentImageIndex].image_url}
                alt={filteredImages[currentImageIndex].title}
                className="max-h-[80vh] max-w-[90vw] object-contain"
              />
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-white">
                  {filteredImages[currentImageIndex].title}
                </h3>
                <p className="text-orange-500">
                  {filteredImages[currentImageIndex].category}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}