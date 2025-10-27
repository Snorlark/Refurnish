"use client";
import React, { ReactNode } from 'react';
import ChatBubble from '../../../components/ChatBubble';
import NavbarMenu from '../../../components/Navbar-Menu';

export default function UserProfileLayout({ children }: { children: ReactNode }) {
  const handleWishlistClick = () => {};
  const handleCartClick = () => {};
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarMenu onWishlistClick={handleWishlistClick} onCartClick={handleCartClick} />

      {/* Full screen content - NO SIDEBAR */}
      <div className="w-full pt-16">
        {children}
      </div>
      
      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}
