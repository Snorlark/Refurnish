"use client";
import React, { useState } from 'react';
import { Users, Target, Award, Globe, Mail, Phone, MapPin, ArrowLeft, LogOut } from 'lucide-react';
import UserProfileSidebar from '../../components/UserProfileSidebar';
import Footer from '../../components/Footer';
import LogoutModal from '../../components/LogoutModal';
import { Menu } from 'lucide-react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const AboutPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const teamMembers = [
    {
      name: "Lark Sigmuond Babao",
      role: "Project Manager",
      image: "/api/placeholder/200/200",
      description: "Luto na ang kanin, pwede niyo na kong ulamin."
    },
    {
      name: "Arwind Alan Roie Cariño",
      role: "Software Developer",
      image: "/api/placeholder/200/200", 
      description: "Anong basa sa Gucci? Guchi? Aral ka muna Gussi yun hindi Guchi!"
    },
    {
      name: "Jason Angeles",
      role: "Software Developer",
      image: "/api/placeholder/200/200",
      description: "Kai Sotto, ginuho ang munggo."
    },
    {
      name: "Angelique Anne Valdez",
      role: "Software Developer",
      image: "/api/placeholder/200/200",
      description: "Dili ko gahatag ug iyot."
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

  return (
    <>
      {/* Sidebar */}
        <UserProfileSidebar 
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

        {/* Custom Profile Navbar - Fixed at top */}
        <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">About Us</h1>
              </div>
              <button
                onClick={handleLogoutClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      {/* Mobile hamburger to toggle profile sidebar */}
      <button
        aria-label="Open profile menu"
        className="md:hidden fixed top-16 left-4 z-40 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm active:scale-95"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 ml-0 w-full">
          <div className="pt-16 px-4 sm:px-6 lg:px-8">
         
          {/* Main Content */}
          <div className="flex-1">
            <div className="p-0">
              <div className="w-full mx-auto">                
                  {/* Hero Section */}
                  <div className="relative" style={{backgroundImage: 'url(/bg-heropage.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0 bg-black/40 z-0"></div>
                    <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-lg">About REFURNISH</h2>
                      <p className="text-base sm:text-lg lg:text-xl text-white/95 max-w-2xl drop-shadow">
                        Transforming the way people buy and sell furniture through sustainable marketplace solutions.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 lg:p-8">
                    {/* Mission Section */}
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                        <div>
                          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                            At REFURNISH, we believe that quality furniture deserves more than one life. Our mission is to create a sustainable marketplace where pre-owned furniture finds new homes, reducing waste while making beautiful, quality pieces accessible to everyone.
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            We&apos;re committed to building a circular economy for furniture, where every piece has the opportunity to be loved again, reducing environmental impact while connecting people with amazing finds.
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
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                          REFURNISH was born from a simple observation: too much quality furniture ends up in landfills while people struggle to find affordable, well-made pieces for their homes. Our founders, passionate about both design and sustainability, saw an opportunity to create a platform that would solve both problems.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6">
                          What started as a small marketplace for pre-owned furniture has grown into a thriving community of sellers and buyers who share our vision of sustainable living. We&apos;ve facilitated thousands of transactions, saved countless pieces from waste, and helped create beautiful homes across the country.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          Today, REFURNISH continues to grow, but our mission remains the same: to make quality furniture accessible while protecting our planet for future generations.
                        </p>
                      </div>
                    </section>

                    {/* Contact Section */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
      <Footer />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
      
    </>
  );
};

export default AboutPage;