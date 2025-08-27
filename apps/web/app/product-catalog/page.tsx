"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthModal from '../../components/AuthModal';
import CartSidebar from '../../components/CartSidebar';
import WishlistSidebar from '../../components/WishlistSidebar';
import ChatBubble from '../../components/ChatBubble';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { products } from '../../data/products';

export default function ProductCatalog() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(category);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price-low, price-high, newest
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Use shared hooks
  const cart = useCart();
  const wishlist = useWishlist();

  const categories = [
    { name: 'ALL', value: 'all' },
    { name: 'CHAIRS', value: 'chairs' },
    { name: 'TABLES', value: 'tables' },
    { name: 'SOFA', value: 'sofa' },
    { name: 'CABINET', value: 'cabinet' },
    { name: 'BEDROOM', value: 'bedroom' },
    { name: 'DECOR', value: 'decor' },
    { name: 'MIRROR', value: 'mirror' },
  ];


  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceNum - b.priceNum;
        case 'price-high':
          return b.priceNum - a.priceNum;
        case 'newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Search functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/product-catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Update category and search from URL params
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
    
    if (urlSearch && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  return (
    <main className="bg-white font-['Futura'] min-h-screen">
      {/* Navbar */}
      <Navbar 
        variant="catalog"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onAuthClick={() => setIsAuthModalOpen(true)}
        cartItemsCount={cart.cartItems.length}
        wishlistItemsCount={wishlist.wishlistItems.length}
        onCartClick={() => cart.setIsCartOpen(true)}
        onWishlistClick={() => wishlist.setIsWishlistOpen(true)}
      />

      {/* Content */}
      <div className="pt-24 px-4 md:px-6 lg:px-16">
        <div className="container mx-auto">
          {/* Back Button */}
          <div className="mb-6 md:mb-8">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-(--color-primary) hover:text-(--color-olive) transition-colors duration-300 group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Category Navigation */}
          <div className="flex items-center justify-start md:justify-center overflow-x-auto space-x-4 md:space-x-8 mb-6 md:mb-8 border-b border-gray-200 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`pb-2 md:pb-4 px-2 text-xs md:text-sm font-medium tracking-wide transition-all duration-300 relative whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {cat.name}
                {activeCategory === cat.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-100 transition-transform duration-300"></div>
                )}
              </button>
            ))}
            <button className="pb-2 md:pb-4 px-2 text-gray-500 hover:text-black text-xs md:text-sm font-medium whitespace-nowrap">
              +
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-xs md:text-sm text-black font-medium">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg bg-white text-xs md:text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            <span className="text-xs md:text-sm text-black font-medium">{filteredProducts.length} items</span>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-12 md:mb-16">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500 group transform hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="relative overflow-hidden bg-gray-100">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 md:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button 
                    onClick={() => wishlist.toggleWishlist(product)}
                    className={`absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white ${
                      wishlist.isInWishlist(product.id) ? 'bg-red-100' : 'bg-white/80'
                    }`}
                  >
                    <img 
                      src="/icon/heartIcon.png" 
                      alt="wishlist" 
                      className={`w-3 h-3 md:w-4 md:h-4 ${wishlist.isInWishlist(product.id) ? 'filter brightness-0 saturate-100 invert-[0.2] sepia-[1] saturate-[5] hue-rotate-[340deg]' : ''}`}
                    />
                  </button>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-medium text-black text-xs md:text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-black font-semibold text-sm md:text-base mb-2">{product.price}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 text-xs">
                      <img src="/icon/locateIcon.png" alt="location" className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                      <span className="truncate text-xs">{product.location}</span>
                    </div>
                    <button 
                      onClick={() => cart.addToCart(product)}
                      className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 transform hover:scale-110"
                    >
                      <img src="/icon/addtocart.png" alt="add to cart" className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cart.isCartOpen}
        onClose={() => cart.setIsCartOpen(false)}
        cartItems={cart.cartItems}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeFromCart}
        totalPrice={cart.getTotalPrice()}
      />

      {/* Wishlist Sidebar */}
      <WishlistSidebar 
        isOpen={wishlist.isWishlistOpen}
        onClose={() => wishlist.setIsWishlistOpen(false)}
        wishlistItems={wishlist.wishlistItems}
        onRemoveItem={wishlist.removeFromWishlist}
        onAddToCart={cart.addToCart}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Chat Bubble */}
      <ChatBubble />
    </main>
  );
}
