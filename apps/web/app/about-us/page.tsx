"use client";
import { useState } from 'react';
import Navbar from '../../components/Navbar-Products';

export default function AboutUs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState(0);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search submission
    console.log('Search submitted:', searchQuery);
  };

  const handleAuthClick = () => {
    // Handle authentication click
    console.log('Auth clicked');
  };

  const handleCartClick = () => {
    // Handle cart click
    console.log('Cart clicked');
  };

  const handleWishlistClick = () => {
    // Handle wishlist click
    console.log('Wishlist clicked');
  };

  return (
    <>
    <div className="min-h-screen relative">
      
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg-aboutus.png)',
        
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <Navbar
          variant="home"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onAuthClick={handleAuthClick}
          cartItemsCount={cartItemsCount}
          wishlistItemsCount={wishlistItemsCount}
          onCartClick={handleCartClick}
          onWishlistClick={handleWishlistClick}
        />

        {/* Main Content */}
        <main className="pt-24  pb-16 px-4 sm:px-6 lg:px-8">

          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <section className="mb-16">
              <img src="/RefurnishLogoAboutUs.png" alt="Logo" className="w-auto h-30 sm:mt-8 mx-auto object-center">
              
              </img>
            </section>

            {/* About Us Section */}
            <section className="mb-16">
              <h2 className="text-3xl sm:text-2xl font-sans font-semibold text-white mb-8">
                About Us
              </h2>
              <div className="space-y-8 text-white/90 text-base sm:text-lg leading-relaxed">
                <p>
                  At Refurnish, we believe every piece of furniture has a story — and deserves a second one. 
                  We are a Philippines-based online marketplace dedicated to giving pre-loved, unused, and 
                  &quot;didn't-fit-the-space&quot; furniture a new home. Whether you&apos;re downsizing, moving, or just 
                  looking for something new, Refurnish connects sellers and buyers in a safe, convenient, 
                  and sustainable way.
                </p>
                <p>
                  By extending the life of quality furniture, we help reduce waste and promote a culture 
                  of reuse in the community. From newlyweds furnishing their first home, to students 
                  decorating their dorms, to café owners searching for unique pieces — Refurnish is here 
                  to bridge the gap between those who have and those who need.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact">
              <h2 className="text-1xl font-sans sm:text-2xl md:mt-22 font-semibold text-white mb-8">
                Get in touch with us
              </h2>
              <div className="space-y-2 text-white/90 text-base sm:text-lg">
                <p>
                  <span className="font-semibold">Email:</span> support@refurnish.ph
                </p>
                <p>
                  <span className="font-semibold">Mobile / Viber:</span> +63 912 345 6789
                </p>
                <p>
                  <span className="font-semibold">Messenger:</span> m.me/refurnishph
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
