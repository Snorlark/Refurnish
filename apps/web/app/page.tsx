"use client";

import Image from "next/image";
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const navbarRef = useRef<HTMLElement>(null);

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
      <nav 
        ref={navbarRef}
        className="bg-white/95 backdrop-blur-md rounded-full mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
        style={{ height: '80px' }}
      >
        <div className="nav-inner max-w-7xl mx-auto px-6 lg:px-9 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <div className="nav-logo flex items-center">
              <img src="/icon/RF.png" alt="Logo" className="h-6 w-auto object-cover" />            
            </div>

            {/* Center Navigation */}
            <div className="nav-links hidden md:flex space-x-22 md:space-x-10 lg:space-x-18 xl:space-x-22 text-sm font-medium text-gray-700">
              <Link href="/" className="hover:text-green-900 transition-modern">Home</Link>
              <Link href="/shop" className="hover:text-green-900 transition-modern">Shop</Link>
              <Link href="/about" className="hover:text-green-900 transition-modern">About</Link>
              <Link href="/contact" className="hover:text-green-900 transition-modern">Contact</Link>
            </div>

            {/* Right Icons */}
            <div className="nav-icons hidden md:flex items-center space-x-8 md:space-x-4 lg:space-x-6 xl:space-x-8 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
                <img src="/icon/userIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
              <img src="/icon/searchIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
                <img src="/icon/heartIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
                <img src="/icon/cartIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="h-20 bg-(--color-white)"></div>
      <div className="relative  h-screen bg-cover bg-center" style={{backgroundImage: 'url(/bg-heropage.png)'}}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 h-full flex items-center justify-end pl-7 pr-8 md:pr-20 lg:pr-32">
          <div className="bg-(--color-white) backdrop-blur-sm p-10 radius-20 shadow-modern max-w-lg">
            <p className="text-[16px] uppercase tracking-[0.1em] text-(--color-primary) mb-3 font-normal">Welcome Offer</p>
            <h1 className="text-[35px] md:text-[38px] font-bold text-(--color-olive) mb-3 leading-tight tracking-tight">
              Save $10 on your first order!
            </h1>
            <p className="text-(--color-black) mb-8 font-light leading-relaxed text-[14px] md:text-[15px]">
              Enjoy a 10% discount on your first two furniture purchases when you sign up today.
            </p>
            <button className="bg-(--color-olive) tracking-[0.1em] text-white px-10 py-4 rounded-full font-normal cursor-pointer transition-modern text-[12px] md:text-[14px]">
              BUY NOW
            </button>
          </div>
        </div>
      </div>


      {/* Affordable Style Section */}
      <div className="py-22 px-6 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
            Affordable Style, Sustainable Choice.
          </h2>
          <p className="text-[16px] text-gray-700 max-w-3xl mx-auto mb-16 leading-relaxed">
            Elevate your home's look without breaking the bank. Our pre-loved furniture offers a unique, affordable, and eco-friendly way to shop for your space.
          </p>
          
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mx-2 md:max-w-4xl sm:mx-auto">
            
            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/living.png" alt="Living" className="w-auto h-100 object-center group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-8">
                  <h3 className="text-[18px] font-semibold text-(--color-primary)">Living</h3>
              </div>
            </div>

            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/dining.png" alt="Dining" className="w-auto h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-8">
                  <h3 className="text-[18px] font-semibold text-(--color-primary)">Dining</h3>
              </div>
            </div>

            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/bedroom.png" alt="Bedroom" className="w-auto h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-8">
                  <h3 className="text-[18px] font-semibold text-(--color-primary)">Bedroom</h3>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t-[0.2px] border-(--color-olive) mx-20 text-center"></div>

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
          <div className="grid grid-cols-1  md:mx-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {/* Product Cards - Reusing images for now */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <div key={index} className="bg-white radius-20 shadow-modern hover:shadow-modern-hover transition-modern overflow-hidden group">
                <div className="relative">
                  <img 
                    src={index % 3 === 0 ? "/living.png" : index % 3 === 1 ? "/dining.png" : "/bedroom.png"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-60 object-cover group-hover:scale-105 transition-modern"
                  />
                  {index === 2 && (
                    <div className="absolute top-4 left-4">
                      
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-(--color-olive) mb-2 text-[15px]">
                    {index === 0 ? "Filing Cab on Wheels" : 
                     index === 1 ? "Bent Ply Office Chair" : 
                     index === 2 ? "Muji Style Low Chair" : 
                     index === 3 ? "12-Layered Oak Dra..." : 
                     `Product ${index + 1}`}
                  </h3>
                  <p className="text-(--color-primary) font-medium text-[14px]">₱ 12,000.00</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-(--color-primary) font-light text-[12px] ">
                      <img src="/icon/locateIcon.png" alt="locate" className="w-auto h-4 pr-2 object-cover transition-modern" />
                       Amanpulo
                    </div>
                    <div className="flex items-center space-x-3">
                      
                      <button className="cursor-pointer">
                       <img src="/icon/addtocart.png" alt="addtocart" className="w-auto h-8 pr-1 mb-1 object-center transition-modern" />

                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explore More Button */}
          <div className="text-center">
            <button className=" shadow-sm box-sha tracking-[0.1em] text-(--color-primary) cursor-pointer border-2 border-(--color-primary) px-8 py-4 rounded-full font-medium transition-modern text-[12px]">
              EXPLORE MORE
            </button>
          </div>
        </div>
      </div>

            <div className="border-t-[0.2px] border-(--color-olive) mx-20 text-center"></div>


      {/* Feature Sections */}
      <div className="py-24 px-6 lg:px-16 mx-30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]  items-start gap-16">
            {/* Left copy blocks */}
            <div className="order-2 lg:order-1 space-y-16 lg:space-y-24 text-left xl:pt-25">
              <div>
                <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive) mb-4 leading-tight">Nationwide Delivery Assistance</h3>
                <p className="text-gray-700 leading-relaxed text-[16px] md:text-[14px] max-w-md">
                  Get connected with trusted couriers across the Philippines, giving you options for the most convenient and affordable delivery service for your location.
                </p>
              </div>

              
            </div>

            {/* Center stacked images */}
            <div className="order-1 lg:order-2 flex flex-col items-center gap-8">
              <div className="bg-white radius-20 overflow-hidden w-full max-w-[420px]">
                <img src="/forfeature.png" alt="Feature 1" className="w-full h-80 object-center" />
              </div>
              <div>
                <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive) mb-4 leading-tight">Curated Quality Finds</h3>
                <p className="text-gray-700 leading-relaxed text-base md:text-[14px] max-w-md">
                  Every piece listed on our platform is reviewed to ensure accurate descriptions, clear photos, and honest condition ratings.
                </p>
            </div>



            </div>

            {/* Right copy block */}
            <div className="order-3 lg:order-3 text-left">
              <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive)  mb-4 leading-tight">Budget-Friendly & Sustainable Furniture</h3>
              <p className="text-gray-700 leading-relaxed text-base md:text-[14px] max-w-md">
                Discover pre-loved and unused furniture that fits your budget without compromising on quality and style. With our furniture swapping initiative, you can also trade items with other users to refresh your home.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REFURNISH Section */}
      <div className="relative py-18 px-6 h-screen lg:px-16" style={{backgroundImage: 'url(/refurnishSection.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
                <img src="/refurnishlogoSection.png" alt="Feature 1" className=" lg:ml-110 xl:ml-150 w-100 h-auto object-center" />
          
          <div className="flex flex-col sm:flex-row mt-2 lg:ml-110  xl:ml-150 gap-6">
            <button className=" text-(--color-olive) cursor-pointer tracking-[0.1em] rounded-full border-2 border-(--color-olive) px-7 py-3 font-semibold transition-modern text-[12px]">
              BUY NOW
            </button>
            
           
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

      {/* Giving Furniture Section */}
      <div className="py-24 px-6 lg:px-16 bg-gray-50/50">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-5 leading-tight tracking-tight">
            Giving Furniture a Second Home
          </h2>
          <p className="text-[16px] text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
          </p>
          <button className="bg-(--color-olive) text-(--color-white) px-8 py-4 rounded-full shadow-modern cursor-pointer font-normal tracking-[0.1em] transition-modern text-[11px]">
            SIGN UP NOW
          </button>
        </div>
      </div>

      <div className="border-t-[0.2px] border-(--color-olive) mt-12  text-center"></div>

{/* footer */}
      <footer className="bg-(--color-white) text-(--color-primary) py-16 px-6 lg:px-16">
        <div className="max-w-7xl px-6 lg:px-9 py-4 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo and Social */}
            <div>
                <img src="/refurnishlogoSection.png" alt="Logo" className=" w-60 pb-2 h-auto object-center" />
              <div className="flex space-x-3">
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-md font-semibold mb-4">Information</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Privacy</a></li>
                <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Terms of Use</a></li>
                <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">About Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-md font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li>Email: info@refurnish.com</li>
                <li>Mobile/Viber: +63 912 345 6789</li>
                <li>Messenger: @refurnish</li>
              </ul>
            </div>

            
            <div>
              <p className="text-bottom text-sm">© 2023. All rights reserved.</p>
            </div>
          </div>
          
        </div>
      </footer>
    </main>
  );
}
