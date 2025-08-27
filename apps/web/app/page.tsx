"use client";
import Image from "next/image";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import CartSidebar from '../components/CartSidebar';
import WishlistSidebar from '../components/WishlistSidebar';
import ChatBubble from '../components/ChatBubble';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const navbarRef = useRef<HTMLElement>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Use shared hooks
  const cart = useCart();
  const wishlist = useWishlist();

  useEffect(() => {
    if (!navbarRef.current) return;

    // Create the shrinking animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "+=100",
        scrub: 0.5,
        onUpdate: (self) => {
          // Update navbar styles based on scroll progress
          const progress = self.progress;
          
          // Shrink height
          const height = gsap.utils.interpolate(80, 60, progress);
          
          // Shrink horizontal margins
          const marginX = gsap.utils.interpolate(32, 18, progress);
          const marginY = gsap.utils.interpolate(0, 16, progress);
          
          // Adjust padding
          const paddingX = gsap.utils.interpolate(26, 16, progress);
        
          
          // Apply styles
          gsap.set(navbarRef.current, {
            height: height,
            marginLeft: marginX,
            marginRight: marginX,
            marginTop: marginY,
            marginBottom: marginY,
          });
          
          // Update inner container padding
          const innerContainer = navbarRef.current?.querySelector('.nav-inner');
          if (innerContainer) {
            gsap.set(innerContainer, {
              paddingLeft: paddingX,
              paddingRight: paddingX,
            });
          }
          
          // Scale down logo slightly
          const logo = navbarRef.current?.querySelector('.nav-logo img');
          if (logo) {
            const logoScale = gsap.utils.interpolate(1, 0.85, progress);
            gsap.set(logo, { scale: logoScale });
          }
          
          // Scale down navigation text
          const navLinks = Array.from(navbarRef.current?.querySelectorAll('.nav-links a') || []);
          navLinks.forEach((link) => {
            const textScale = gsap.utils.interpolate(1, 0.9, progress);
            gsap.set(link, { scale: textScale });
          });
          
          // Scale down icons
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

  return (
    <main className="bg-white font-['Futura']">
      {/* Navbar */}
      <Navbar 
        variant="home"
        onAuthClick={() => setIsAuthModalOpen(true)}
        cartItemsCount={cart.cartItems.length}
        wishlistItemsCount={wishlist.wishlistItems.length}
        onCartClick={() => cart.setIsCartOpen(true)}
        onWishlistClick={() => wishlist.setIsWishlistOpen(true)}
      />

      {/* Hero Section */}
      <div className="h-20 bg-(--color-white)"></div>
      <div className="relative h-screen bg-cover bg-center" style={{backgroundImage: 'url(/bg-heropage.png)'}}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 h-full flex items-center justify-center md:justify-end px-4 md:pl-7 md:pr-8 lg:pr-20 xl:pr-32">
          <div className="bg-(--color-white) backdrop-blur-sm p-6 md:p-10 radius-20 shadow-modern max-w-lg w-full md:w-auto">
            <p className="text-[14px] md:text-[16px] uppercase tracking-[0.1em] text-(--color-primary) mb-3 font-normal">Welcome Offer</p>
            <h1 className="text-[28px] md:text-[35px] lg:text-[42px] font-bold text-(--color-olive) mb-3 leading-tight tracking-tight">
              Save $10 on your first order!
            </h1>
            <p className="text-(--color-black) mb-8 font-light leading-relaxed text-[14px] md:text-[15px] lg:text-[16px]">
              Enjoy a 10% discount on your first two furniture purchases when you sign up today.
            </p>
            <Link href="/shop">
              <button className="bg-(--color-olive) tracking-[0.1em] text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-normal hover:bg-green-800 transition-modern text-[14px] md:text-[16px] w-full md:w-auto">
                BUY NOW
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Affordable Style Section */}
      <div className="py-16 md:py-22 px-4 md:px-6 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-xl md:text-2xl lg:text-[32px] font-bold text-(--color-primary) mb-5 md:mb-7 leading-tight tracking-tight">
            Affordable Style, Sustainable Choice.
          </h2>
          <p className="text-[14px] md:text-[16px] text-gray-700 max-w-3xl mx-auto mb-12 md:mb-16 leading-relaxed px-4">
            Elevate your home's look without breaking the bank. Our pre-loved furniture offers a unique, affordable, and eco-friendly way to shop for your space.
          </p>
          
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mx-2 md:max-w-4xl sm:mx-auto">
            
            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/living.png" alt="Living" className="w-full h-48 md:h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-4 md:p-8">
                  <h3 className="text-lg md:text-2xl font-semibold text-(--color-primary)">Living</h3>
              </div>
            </div>

            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/dining.png" alt="Dining" className="w-full h-48 md:h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-4 md:p-8">
                  <h3 className="text-lg md:text-2xl font-semibold text-(--color-primary)">Dining</h3>
              </div>
            </div>

            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/bedroom.png" alt="Bedroom" className="w-full h-48 md:h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-4 md:p-8">
                  <h3 className="text-lg md:text-2xl font-semibold text-(--color-primary)">Bedroom</h3>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Our Products Section */}
      <div className="py-20 px-6 lg:px-16 bg-gray-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
              Our Products
            </h2>
          <p className="text-[16px] text-gray-700 max-w-2xl mx-auto mb-16 leading-relaxed">
              This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16 px-2 md:px-0">
            {/* Product Cards - Reusing images for now */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <div key={index} className="bg-white radius-20 shadow-modern hover:shadow-modern-hover transition-modern overflow-hidden group">
                <div className="relative">
                  <img 
                    src={index % 3 === 0 ? "/living.png" : index % 3 === 1 ? "/dining.png" : "/bedroom.png"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 md:h-48 lg:h-70 object-cover group-hover:scale-105 transition-modern"
                  />
                  {index === 2 && (
                    <div className="absolute top-4 left-4">
                      
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-5">
                  <h3 className="font-bold text-(--color-olive) mb-2 text-[14px] md:text-[18px] lg:text-[22px] line-clamp-2">
                    {index === 0 ? "Filing Cab on Wheels" : 
                     index === 1 ? "Bent Ply Office Chair" : 
                     index === 2 ? "Muji Style Low Chair" : 
                     index === 3 ? "12-Layered Oak Dra..." : 
                     `Product ${index + 1}`}
                  </h3>
                  <p className="text-(--color-primary) font-medium text-[16px] md:text-[18px] lg:text-[20px] mb-2">₱ 12,000.00</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-(--color-primary) font-light text-[12px] md:text-[14px] lg:text-[16px]">
                      <img src="/icon/locateIcon.png" alt="locate" className="w-3 h-3 md:w-4 md:h-4 mr-1 object-cover transition-modern" />
                      <span className="truncate">Amanpulo</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="cursor-pointer">
                       <img src="/icon/addtocart.png" alt="addtocart" className="w-8 h-7 md:w-10 md:h-9 lg:w-12 lg:h-11 object-center transition-modern" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explore More Button */}
          <div className="text-center px-4">
            <Link href="/shop">
              <button className="shadow-sm box-sha tracking-[0.1em] text-(--color-primary) border-2 border-(--color-primary) px-8 md:px-10 py-3 md:py-4 rounded-full font-medium transition-modern text-base md:text-lg w-full md:w-auto">
                EXPLORE MORE
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="py-16 md:py-24 px-4 md:px-6 lg:px-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {/* Nationwide Delivery */}
            <div className="text-center lg:text-left">
              <div className="bg-white radius-20 shadow-modern overflow-hidden mb-6 md:mb-8 group">
                <img src="/living.png" alt="Delivery" className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900 mb-4 md:mb-6 leading-tight">Nationwide Delivery Assistance</h3>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg px-4 lg:px-0">
                Get connected with trusted couriers across the Philippines, giving you options for the most convenient and affordable delivery service for your location.
              </p>
            </div>

            {/* Curated Quality */}
            <div className="text-center lg:text-left">
              <div className="bg-white radius-20 shadow-modern overflow-hidden mb-6 md:mb-8 group">
                <img src="/dining.png" alt="Quality" className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900 mb-4 md:mb-6 leading-tight">Curated Quality Finds</h3>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg px-4 lg:px-0">
                Every piece listed on our platform is reviewed to ensure accurate descriptions, clear photos, and honest condition ratings.
              </p>
            </div>

            {/* Budget Friendly */}
            <div className="text-center lg:text-left">
              <div className="bg-white radius-20 shadow-modern overflow-hidden mb-6 md:mb-8 group">
                <img src="/bedroom.png" alt="Budget" className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900 mb-4 md:mb-6 leading-tight">Budget-Friendly Furniture</h3>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg px-4 lg:px-0">
                Discover pre-loved and unused furniture at prices that fit your budget, without compromising on style or quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REFURNISH Section */}
      <div className="relative py-16 md:py-24 px-4 md:px-6 lg:px-16" style={{backgroundImage: 'url(/bg-heropage.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight tracking-tight">REFURNISH</h2>
          <p className="text-lg md:text-xl lg:text-2xl text-white mb-8 md:mb-12 font-medium">From their home to yours.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-4">
            <Link href="/shop">
              <button className="bg-green-100 text-green-900 border-2 border-green-900 px-8 md:px-12 py-3 md:py-4 radius-10 font-semibold hover:bg-green-200 transition-modern text-base md:text-lg w-full sm:w-auto">
                Buy Now
              </button>
            </Link>
            <p className="text-white text-base md:text-lg text-center">
              Ready to start selling? <span className="underline cursor-pointer hover:text-green-200 transition-modern">Learn more &gt;</span>
            </p>
          </div>
        </div>
      </div>

      {/* Giving Furniture Section */}
      <div className="py-16 md:py-24 px-4 md:px-6 lg:px-16 bg-gray-50/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-900 mb-6 md:mb-8 leading-tight tracking-tight">
            Giving Furniture a Second Home
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed px-4">
            This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
          </p>
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-green-900 text-white px-8 md:px-12 py-3 md:py-4 radius-10 font-semibold hover:bg-green-800 transition-modern text-base md:text-lg w-full max-w-xs md:w-auto"
          >
            Sign Up Now
          </button>
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
