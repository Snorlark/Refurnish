//hehe
"use client";
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar-Products';
import Footer from '../../components/Footer';
import AuthModal from '../../components/AuthModal';
import CartSidebar from '../../components/CartSidebar';
import WishlistSidebar from '../../components/WishlistSidebar';
import ChatBubble from '../../components/ChatBubble';
import FlashSale from '../../components/FlashSale';
import AnnouncementModal from '../../components/AnnouncementModal';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useContent } from '../../hooks/useContent';
// Remove static product imports - we'll fetch from API instead

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type BackendProduct = {
  _id: string;
  title: string;
  images: string[];
  location: string;
  price?: number;
  category: string;
  status: string;
  listedAs: string;
  createdAt?: string;
};

type DisplayProduct = {
  id: string;
  name: string;
  image: string;
  location: string;
  price: string;
  category: string;
  listedAs: string;
};

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}


export default function Shop() {
  const navbarRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  
  // Product state
  const [saleProducts, setSaleProducts] = useState<DisplayProduct[]>([]);
  const [newProducts, setNewProducts] = useState<DisplayProduct[]>([]);
  const [justForYouProducts, setJustForYouProducts] = useState<DisplayProduct[]>([]);
  const [forSwapProducts, setForSwapProducts] = useState<DisplayProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Use shared hooks
  const cart = useCart();
  const wishlist = useWishlist();
  const { carouselSlides, announcements, isLoading } = useContent();
  
  // Fallback hero slides if no carousel slides from API
  const fallbackHeroSlides = [
    {
      image: '/bg-heropage.png',
      isRefurnishSlide: true,
      link: undefined,
      scrollTo: undefined
    },
    {
      image: '/sale-pic.png', 
      scrollTo: 'on-sale',
      link: undefined,
      isRefurnishSlide: false
    },
    {
      image: '/swap-pic.png',
      scrollTo: 'swap',
      link: undefined,
      isRefurnishSlide: false
    }
  ];

  // Combine API carousel slides with fallback slides
  const apiSlides = carouselSlides.map(slide => ({
    image: slide.image,
    title: slide.title,
    description: slide.description,
    link: slide.link,
    isRefurnishSlide: slide.title.toLowerCase().includes('refurnish'),
    scrollTo: slide.link ? undefined : (slide.title.toLowerCase().includes('sale') ? 'on-sale' : 
            slide.title.toLowerCase().includes('swap') ? 'swap' : undefined)
  }));
  
  const heroSlides = [...apiSlides, ...fallbackHeroSlides];
  
  // Debug: Log the processed slides
  console.log('API slides:', apiSlides);
  console.log('Hero slides:', heroSlides);

  // Show announcement modal if there are announcements
  useEffect(() => {
    if (announcements.length > 0 && !isLoading) {
      setShowAnnouncementModal(true);
    }
  }, [announcements, isLoading]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        
        // Fetch all listed products
        const res = await fetch(`${API_BASE_URL}/api/products?status=listed`);
        const data: BackendProduct[] = await res.json();
        
        if (!res.ok) throw new Error('Failed to load products');

        // Transform products
        const transformed: DisplayProduct[] = data.map((p) => ({
          id: p._id,
          name: p.title,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '/products/chair/view1.jpg',
          location: p.location || 'Metro Manila',
          price: p.price ? `₱${p.price.toLocaleString()}` : 'Price on request',
          category: (p.category || 'UNCATEGORIZED').toUpperCase(),
          listedAs: p.listedAs || 'sale',
        }));

        // Separate products by type
        const sale = transformed.filter(p => p.listedAs === 'sale' || p.listedAs === 'both');
        const swap = transformed.filter(p => p.listedAs === 'swap' || p.listedAs === 'both');
        
        // Sort by creation date for "new" products
        const sortedByDate = [...transformed].sort((a, b) => {
          const aDate = data.find(p => p._id === a.id)?.createdAt || '';
          const bDate = data.find(p => p._id === b.id)?.createdAt || '';
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });

        setSaleProducts(sale.slice(0, 6));
        setNewProducts(sortedByDate.slice(0, 6));
        setJustForYouProducts(sortedByDate.slice(6, 12)); // Next 6 products
        setForSwapProducts(swap.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
        setSaleProducts([]);
        setNewProducts([]);
        setJustForYouProducts([]);
        setForSwapProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Navbar animation (reused from Home)
  useEffect(() => {
    if (!navbarRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "+=100",
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const height = gsap.utils.interpolate(80, 60, progress);
          const marginX = gsap.utils.interpolate(32, 18, progress);
          const marginY = gsap.utils.interpolate(0, 16, progress);
          const paddingX = gsap.utils.interpolate(26, 16, progress);
          
          gsap.set(navbarRef.current, {
            height: height,
            marginLeft: marginX,
            marginRight: marginX,
            marginTop: marginY,
            marginBottom: marginY,
          });
          
          const innerContainer = navbarRef.current?.querySelector('.nav-inner');
          if (innerContainer) {
            gsap.set(innerContainer, {
              paddingLeft: paddingX,
              paddingRight: paddingX,
            });
          }
          
          const logo = navbarRef.current?.querySelector('.nav-logo img');
          if (logo) {
            const logoScale = gsap.utils.interpolate(1, 0.85, progress);
            gsap.set(logo, { scale: logoScale });
          }
          
          const navLinks = Array.from(navbarRef.current?.querySelectorAll('.nav-links a') || []);
          navLinks.forEach((link) => {
            const textScale = gsap.utils.interpolate(1, 0.9, progress);
            gsap.set(link, { scale: textScale });
          });
          
          const icons = Array.from(navbarRef.current?.querySelectorAll('.nav-icons > div') || []);
          icons.forEach((icon) => {
            const iconScale = gsap.utils.interpolate(1, 0.9, progress);
            gsap.set(icon, { scale: iconScale });
          });
        }
      }
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Carousel auto-change
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % heroSlides.length;
        console.log('Auto-advancing from slide', prev, 'to slide', nextSlide);
        return nextSlide;
      });
    }, 5000); // Increased to 5 seconds for better UX

    return () => clearInterval(interval);
  }, []);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    console.log('Scrolling to:', sectionId); // Debug log
    const element = document.getElementById(sectionId);
    console.log('Element found:', element); // Debug log
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('Element not found with ID:', sectionId);
    }
  };

  // Search functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/product-catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };


  const categoryButtons = [
    { name: 'Chairs', image: '/living.png', category: 'chairs' },
    { name: 'Tables', image: '/dining.png', category: 'tables' },
    { name: 'Sofa', image: '/bedroom.png', category: 'sofa' },
    { name: 'Cabinet', image: '/living.png', category: 'cabinet' },
    { name: 'Decor', image: '/dining.png', category: 'decor' },
    { name: 'Mirror', image: '/bedroom.png', category: 'mirror' },
    { name: 'Lamp', image: '/living.png', category: 'lamp' }
  ];


  return (
    <main className="
      bg-gradient-to-r from-[#fffef3] via-[#e9efcf] via-[#dbe6ae] to-[#eef0c4de]  
      animate-gradient-wave font-sans">
      {/* Navbar */}
      <Navbar 
        variant="shop"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onAuthClick={() => setIsAuthModalOpen(true)}
        cartItemsCount={cart.cartItems.length}
        wishlistItemsCount={wishlist.wishlistCount}
        onCartClick={() => cart.setIsCartOpen(true)}
        onWishlistClick={() => wishlist.setIsWishlistOpen(true)}
      />

      {/* Hero Carousel Section */}
      <div className="h-20 bg-[#fbfbfb]/72 "></div>
      <div className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              console.log('Slide clicked:', slide); // Debug log
              console.log('Slide link:', slide.link); // Debug log
              console.log('Slide scrollTo:', slide.scrollTo); // Debug log
              
              if (slide.link && slide.link.trim() !== '') {
                console.log('Opening external link:', slide.link);
                // Open external link in new tab
                window.open(slide.link, '_blank', 'noopener,noreferrer');
                return;
              }
              
              if (slide.scrollTo) {
                console.log('Scrolling to section:', slide.scrollTo);
                // Scroll to internal section
                scrollToSection(slide.scrollTo);
                return;
              }
              
              console.log('No action defined for this slide');
            }}
            onMouseDown={(e) => {
              // Also handle mousedown to ensure click is captured
              if (slide.link && slide.link.trim() !== '') {
                e.preventDefault();
                console.log('MouseDown - Opening external link:', slide.link);
                window.open(slide.link, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            {/* Clickable overlay for slides with links */}
            {slide.link && slide.link.trim() !== '' && (
              <div 
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Overlay clicked - Opening link:', slide.link);
                  window.open(slide.link, '_blank', 'noopener,noreferrer');
                }}
                title={`Click to visit: ${slide.link}`}
              />
            )}
            
            {slide.isRefurnishSlide && (

              <div className="relative py-18 px-6 h-screen lg:px-16" style={{backgroundImage: 'url(/refurnishSection.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto text-center">
                        <img src="/refurnishlogoSection.png" alt="Feature 1" className=" lg:ml-110 xl:ml-150 w-100 h-auto object-center" />
                  
                  <div className="flex flex-col sm:flex-row mt-2 lg:ml-110  xl:ml-150 gap-6">
                    <Link href='/login'>
                    <button className=" text-(--color-olive) hover:text-(--color-white) hover:bg-(--color-olive) hover:scale-105 hover:font-medium hover:translate-y-1 cursor-pointer tracking-[0.1em] rounded-full border-2 border-(--color-olive) px-7 py-3 font-semibold transition-modern text-[12px]">
                      BUY NOW
                    </button>
                    </Link>
                    
                  
                  </div>
                  <p className="text-(--color-olive) text-right pt-60 font-bold">
                      Ready to start  
                    </p>
                    <p className="text-(--color-olive) text-right text-[24px] font-bold">
                      selling? 
                    </p > 
                    <p className="text-(--color-olive) font-normal underline cursor-pointer text-[16px]  text-right transition-modern">
                    Learn More 
                    </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => {
                console.log('Indicator clicked, setting slide to:', index);
                setCurrentSlide(index);
              }}
            />
          ))}
        </div>
        {/* Navigation Arrows */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all z-20"
          onClick={() => {
            const newSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
            console.log('Left arrow clicked, going to slide:', newSlide);
            setCurrentSlide(newSlide);
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all z-20"
          onClick={() => {
            const newSlide = (currentSlide + 1) % heroSlides.length;
            console.log('Right arrow clicked, going to slide:', newSlide);
            setCurrentSlide(newSlide);
          }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* On Sale Section */}
      <div id="on-sale" className="py-16 md:mx-10 font-sans px-6 lg:px-16">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-12 text-center">
            On Sale</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {isLoadingProducts ? (
              <div className="flex-shrink-0 w-full text-center py-20 text-gray-500">
                Loading products...
              </div>
            ) : saleProducts.length === 0 ? (
              <div className="flex-shrink-0 w-full text-center py-20 text-gray-500">
                No sale products available yet.
              </div>
            ) : (
              saleProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/item-view-sale?id=${encodeURIComponent(product.id)}`}
                  className="block flex-shrink-0 w-64"
                >
                  <div 
                    className="relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-(--color-olive) text-md mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-(--color-primary) font-bold text-base">{product.price}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-gray-600 text-xs">
                          <img src="/icon/locateIcon.png" alt="location" className="w-3 h-4 mr-2" />
                          {product.location}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            cart.addToCart(product);
                          }}
                          className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200"
                        >
                          <img src="/icon/addtocart.png" alt="add to cart" className="w-auto h-7" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Products Section */}
      <div className="py-16 px-6 lg:px-16  md:mx-10 ">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-12 text-center">New Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {isLoadingProducts ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                Loading products...
              </div>
            ) : newProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                No new products available yet.
              </div>
            ) : (
              newProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={product.listedAs === 'swap' ? `/item-view-swap?id=${encodeURIComponent(product.id)}` : `/item-view-sale?id=${encodeURIComponent(product.id)}`}
                  className="block"
                >
                  <div 
                    className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      wishlist.toggleWishlist(product);
                    }}
                    className={`absolute cursor-pointer top-3 right-3 p-2 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white transform hover:scale-110 ${
                      wishlist.isInWishlist(product.id) ? 'bg-red-100' : 'bg-white/80'
                    }`}
                  >
                    <img 
                      src="/icon/heartIcon.png" 
                      alt="wishlist" 
                      className={`w-4 h-4 ${wishlist.isInWishlist(product.id) ? 'filter brightness-0 saturate-100 invert-[0.2] sepia-[1] saturate-[5] hue-rotate-[340deg]' : ''}`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-(--color-olive) text-md mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-(--color-primary) font-bold text-base mb-2">{product.price}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 text-xs">
                      <img src="/icon/locateIcon.png" alt="location" className="w-3 h-3 mr-1" />
                      {product.location}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        cart.addToCart(product);
                      }}
                      className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 transform hover:scale-110"
                    >
                      <img src="/icon/addtocart.png" alt="add to cart" className="w-auto h-7" />
                    </button>
                  </div>
                </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Select Category Section */}
      <div className="py-16 px-6 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-12">Select a Category of Your Choice</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-6xl mx-auto">
            {categoryButtons.map((category, index) => (
              // <Link
              //   key={index}
              //   href={`/product-catalog?category=${category.category}`}
              //   className="group text-center transform hover:scale-105 transition-all duration-300"
              // >
              //   <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden mb-4 group-hover:-translate-y-2">
              //     <div className="relative overflow-hidden">
              //       <img 
              //         src={category.image}
              //         alt={category.name}
              //         className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
              //       />
              //       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              //     </div>
              //   </div>
              //   <h3 className="text-sm font-medium text-(--color-primary) group-hover:text-(--color-olive) transition-colors duration-300">{category.name}</h3>
              // </Link>

                <Link
                  key={index}
                  href={`/product-catalog-sale?category=${encodeURIComponent(category.category.toUpperCase())}`}
                  className="group text-center transform hover:scale-105 transition-all duration-300"
                >
                  <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden mb-4 group-hover:-translate-y-2">
                    <div className="relative overflow-hidden">
                      <img 
                        src={category.image}
                        alt={category.name}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-(--color-primary) group-hover:text-(--color-olive) transition-colors duration-300">
                    {category.name}
                  </h3>
                </Link>



            ))}
          </div>
        </div>
      </div>

      {/* Flash Sale Section */}
      <FlashSale />

      {/* Just For You Section */}
      <div className="py-16 px-6  md:mx-10  lg:px-16">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-12 text-center">Just For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoadingProducts ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                Loading products...
              </div>
            ) : justForYouProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                No products available yet.
              </div>
            ) : (
              justForYouProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={product.listedAs === 'swap' ? `/item-view-swap?id=${encodeURIComponent(product.id)}` : `/item-view-sale?id=${encodeURIComponent(product.id)}`}
                  className="block"
                >
                  <div 
                    className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <button 
                    onClick={() => wishlist.toggleWishlist(product)}
                    className={`absolute  cursor-pointer top-3 right-3 p-2 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white transform hover:scale-110 ${
                      wishlist.isInWishlist(product.id) ? 'bg-red-100' : 'bg-white/80'
                    }`}
                  >
                    <img 
                      src="/icon/heartIcon.png" 
                      alt="wishlist" 
                      className={`w-4 h-4 ${wishlist.isInWishlist(product.id) ? 'filter brightness-0 saturate-100 invert-[0.2] sepia-[1] saturate-[5] hue-rotate-[340deg]' : ''}`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-(--color-olive) text-md mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-(--color-primary) font-bold text-base mb-2">{product.price}.00</p>
                  <div className="flex items-center justify-between">
                    <div className="flex  items-center text-gray-600 text-xs">
                      <img src="/icon/locateIcon.png" alt="location" className="w-3 h-4 mr-2" />
                      {product.location}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        cart.addToCart(product);
                      }}
                      className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 transform hover:scale-110"
                    >
                      <img src="/icon/addtocart.png" alt="add to cart" className="w-auto h-7" />
                    </button>
                  </div>
                </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* For Swap Section */}
      <div id="swap" className="py-16 md:mx-10 px-6 lg:px-16 ">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-(--color-primary) mb-8">For Swap</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoadingProducts ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                Loading products...
              </div>
            ) : forSwapProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                No swap products available yet.
              </div>
            ) : (
              forSwapProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/item-view-swap?id=${encodeURIComponent(product.id)}`}
                  className="block"
                >
                  <div className="bg-white radius-20 shadow-modern hover:shadow-modern-hover transition-modern overflow-hidden group cursor-pointer">
                <div className="relative">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-modern"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-(--color-olive) text-lg mb-2">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-[14px] text-(--color-black)">
                    {/* <span className="mr-2">📋</span> */}
                    <img src="/icon/swapIcon.png" alt="Swap" className="w-4 h-auto" />
                    <span>For Swap</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[13px] text-gray-600">
                    <img src="/icon/locateIcon.png" alt="location" className="w-4 h-5 mr-2" />
                    <span> {product.location}</span>
                  </div>
                </div>
                  </div>
                </Link>
              ))
            )}
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
        isBackendAvailable={cart.isBackendAvailable}
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

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <AnnouncementModal
          announcements={announcements}
          onClose={() => setShowAnnouncementModal(false)}
        />
      )}

      {/* Chat Bubble */}
      <ChatBubble />
    </main>
  );
}