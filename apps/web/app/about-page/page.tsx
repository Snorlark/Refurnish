"use client";
import React, { useState, useEffect, useRef} from 'react';
import { Menu, Search, ShoppingCart, Heart, Users, Target, Award, Globe, Mail, Phone, MapPin } from 'lucide-react';
import UserProfileSidebar from '../../components/UserProfileSidebar';
import Footer from '../../components/Footer';
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const AboutPage = () => {
  const navbarRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const teamMembers = [
    {
      name: "Jihyo Park",
      role: "CEO & Founder",
      image: "/api/placeholder/200/200",
      description: "Passionate about sustainable living and circular economy solutions."
    },
    {
      name: "Jeongyeon Yoo",
      role: "CTO",
      image: "/api/placeholder/200/200", 
      description: "Tech enthusiast focused on creating seamless user experiences."
    },
    {
      name: "Dahyun Kim",
      role: "Head of Operations",
      image: "/api/placeholder/200/200",
      description: "Expert in marketplace operations and customer satisfaction."
    },
    {
      name: "Nayeon Im",
      role: "Head of Marketing",
      image: "/api/placeholder/200/200",
      description: "Creative strategist helping people discover sustainable furniture options."
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "100K+", label: "Furniture Items Sold" },
    { number: "500+", label: "Active Sellers" },
    { number: "95%", label: "Customer Satisfaction" }
  ];

  const values = [
    {
      icon: Globe,
      title: "Sustainability",
      description: "We believe in giving furniture a second life, reducing waste and promoting environmental responsibility."
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Every piece of furniture is carefully vetted to ensure it meets our high standards for quality and condition."
    },
    {
      icon: Users,
      title: "Community",
      description: "We foster a community of conscious consumers who value quality, sustainability, and great design."
    },
    {
      icon: Target,
      title: "Trust",
      description: "We prioritize transparency, security, and reliability in every transaction on our platform."
    }
  ];

  const renderNavbar = () => (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/icon/RF.png" alt="RF Logo" className="h-8 w-auto" />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Cart & Wishlist */}
            <div className="hidden sm:flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder="Search..."
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );

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

  return (
    <>
    <div className="min-h-screen bg-white">
      {/* {renderNavbar()} */}
      {/* NAVBAR */}
        <nav
          ref={navbarRef}
          className="bg-(--color-white)  backdrop-blur-md rounded-full mx-3 sm:mx-6 md:mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
          style={{ height: 72 }}
        >
          <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-9 h-full">
            <div className="flex justify-between items-center h-full gap-3">
              <Link href="/landing" className="nav-logo flex items-center flex-shrink-0">
                <img src="/icon/RF.png" alt="Logo" className="h-6 sm:h-7 w-auto object-cover" />
              </Link>
              <div className="nav-icons flex items-center space-x-3 sm:space-x-4 text-gray-700">
                <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:text-(--color-olive)">
                  <img src="/icon/heartIcon.png" alt="Wishlist" className="h-4 w-auto" />
                </button>
                <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-(--color-olive)">
                  <img src="/icon/cartIcon.png" alt="Cart" className="h-4 w-auto" />
                </button>
               
              </div>
            </div>
          </div>
        </nav>
      
      <div className="flex justify-center">
        <div className="flex max-w-7xl w-full">
          {/* Sidebar */}
          <UserProfileSidebar 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          {/* Main Content */}
          <div className="flex-1 pt-20">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="w-full max-w-[1200px]">
                <div className="bg-white2 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Hero Section */}
                  <div className="relative" style={{backgroundImage: 'url(/bg-heropage.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0 bg-black/40 z-0"></div>
                    <div className="relative z-10 p-8 lg:p-12">
                      <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">About REFURNISH</h2>
                      <p className="text-lg lg:text-xl text-white/95 max-w-2xl drop-shadow">
                        Transforming the way people buy and sell furniture through sustainable marketplace solutions.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    {/* Mission Section */}
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                          <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            At REFURNISH, we believe that quality furniture deserves more than one life. Our mission is to create a sustainable marketplace where pre-owned furniture finds new homes, reducing waste while making beautiful, quality pieces accessible to everyone.
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            We're committed to building a circular economy for furniture, where every piece has the opportunity to be loved again, reducing environmental impact while connecting people with amazing finds.
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 text-center">
                          <Globe className="h-16 w-16 text-(--color-green) mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainable Impact</h3>
                          <p className="text-gray-600">Reducing furniture waste by giving pre-owned pieces a second chance</p>
                        </div>
                      </div>
                    </section>

                    {/* Stats Section */}
                    <section className="mb-12">
                      <div className="bg-gray-50 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Impact</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                              <div className="text-3xl font-bold text-(--color-green) mb-2">{stat.number}</div>
                              <div className="text-gray-600">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Values Section */}
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {values.map((value, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                            <value.icon className="h-10 w-10 text-(--color-green) mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{value.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Team Section */}
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Meet Our Team</h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="text-center">
                            <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <span className="text-gray-600 text-2xl font-bold">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                            <p className="text-(--color-green) font-medium mb-2">{member.role}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{member.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Story Section */}
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
                      <div className="bg-gray-50 rounded-2xl p-8">
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                          REFURNISH was born from a simple observation: too much quality furniture ends up in landfills while people struggle to find affordable, well-made pieces for their homes. Our founders, passionate about both design and sustainability, saw an opportunity to create a platform that would solve both problems.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          What started as a small marketplace for pre-owned furniture has grown into a thriving community of sellers and buyers who share our vision of sustainable living. We've facilitated thousands of transactions, saved countless pieces from waste, and helped create beautiful homes across the country.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          Today, REFURNISH continues to grow, but our mission remains the same: to make quality furniture accessible while protecting our planet for future generations.
                        </p>
                      </div>
                    </section>

                    {/* Contact Section */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <Mail className="h-8 w-8 text-(--color-green)" />
                          <div>
                            <h3 className="font-semibold text-gray-900">Email Us</h3>
                            <p className="text-gray-600">hello@refurnish.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <Phone className="h-8 w-8 text-(--color-green)" />
                          <div>
                            <h3 className="font-semibold text-gray-900">Call Us</h3>
                            <p className="text-gray-600">+1 (555) 123-4567</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <MapPin className="h-8 w-8 text-(--color-green)" />
                          <div>
                            <h3 className="font-semibold text-gray-900">Visit Us</h3>
                            <p className="text-gray-600">123 Green Street, Eco City</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
    </>
  );
};

export default AboutPage;