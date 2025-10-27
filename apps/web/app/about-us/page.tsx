"use client";
import { useState } from 'react';
import Navbar from '../../components/Navbar-Products';
import { useCartContext } from '../../contexts/CartContext';
import { useWishlistContext } from '../../contexts/WishlistContext';

export default function AboutUs() {
  const [searchQuery, setSearchQuery] = useState('');
  const cart = useCartContext();
  const wishlist = useWishlistContext();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', searchQuery);
  };

  const handleAuthClick = () => {
    console.log('Auth clicked');
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleWishlistClick = () => {
    console.log('Wishlist clicked');
  };

  return (
    <>
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-aboutus.png)' }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <Navbar
          variant="home"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onAuthClick={handleAuthClick}
          cartItemsCount={cart.cartCount}
          wishlistItemsCount={wishlist.wishlistCount}
          onCartClick={handleCartClick}
          onWishlistClick={handleWishlistClick}
        />

        {/* Main Content */}
        <main className="pt-28 pb-20 px-3 sm:px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Glass card wrapper */}
            <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-5 sm:p-7 md:p-10">
              {/* Logo + Tagline */}
              <section className="mb-10 sm:mb-12 text-center">
                <img 
                  src="/RefurnishLogoAboutUs.png" 
                  alt="Refurnish Logo"
                  className="w-auto h-16 sm:h-20 mx-auto"
                />
                <p className="mt-4 text-sm sm:text-base text-white/80">
                  Sustainable marketplace for pre-loved furniture in the Philippines
                </p>
              </section>

              {/* About Us */}
              <section className="mb-12 sm:mb-14">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-6">About Refurnish</h1>
                <div className="space-y-6 text-white/90 text-base leading-relaxed">
                  <p>
                    At Refurnish, we believe every piece of furniture has a story — and deserves a second one. 
                    We are a Philippines-based online marketplace dedicated to giving pre-loved, unused, and 
                    &quot;didn&apos;t-fit-the-space&quot; furniture a new home. Whether you&apos;re downsizing, moving, or just 
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

              {/* Contact */}
              <section id="contact" className="">
                <h2 className="text-xl sm:text-2xl font-semibold text-white text-center mb-6">Get in touch</h2>
                <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-white/90 text-sm sm:text-base">
                  <a href="mailto:support@refurnish.ph" className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-colors">
                    <div className="font-semibold text-white mb-1">Email</div>
                    <div>support@refurnish.ph</div>
                  </a>
                  <a href="tel:+639123456789" className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-colors">
                    <div className="font-semibold text-white mb-1">Mobile / Viber</div>
                    <div>+63 912 345 6789</div>
                  </a>
                  <a href="https://m.me/refurnishph" target="_blank" rel="noreferrer" className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-colors">
                    <div className="font-semibold text-white mb-1">Messenger</div>
                    <div>m.me/refurnishph</div>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
