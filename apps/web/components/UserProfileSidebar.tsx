"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Settings, MessageSquare, Info, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileSidebarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  onLogoutClick?: () => void;
}

const UserProfileSidebar = ({ isMobileMenuOpen = false, setIsMobileMenuOpen, onLogoutClick }: UserProfileSidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const sidebarItems = [
    { 
      id: 'Account', 
      label: 'Account', 
      icon: User, 
      href: '/profile/account'
    },
    { 
      id: user?.role === 'seller' ? 'Seller Dashboard' : 'Seller Registration', 
      label: user?.role === 'seller' ? 'Seller Dashboard' : 'Seller Registration', 
      icon: Settings, 
      href: user?.role === 'seller' ? '/profile/seller-dashboard-access' : '/profile/seller-registration'
    },
    { 
      id: 'Messages', 
      label: 'Messages', 
      icon: MessageSquare, 
      href: '/profile/messages'
    },
    { 
      id: 'About Us', 
      label: 'About Us', 
      icon: Info, 
      href: '/profile/about'
    },
    { 
      id: 'Log out', 
      label: 'Log out', 
      icon: LogOut, 
      href: '#',
      onClick: () => {
        onLogoutClick?.();
      }
    }
  ];

  const handleItemClick = (item: typeof sidebarItems[0]) => {
    if (item.onClick) {
      item.onClick();
    }
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderDesktopSidebar = () => (
    <div className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 min-h-screen pt-20 w-[300px]">
      <div className="p-6">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            if (item.onClick) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green border-l-4 border-green'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-green' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green border-l-4 border-(--color-olive)'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-green' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  const renderMobileSidebar = () => (
    <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
      isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen?.(false)}
      />
      
      {/* Menu Panel */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <img src="/icon/RF.png" alt="Logo" className="h-6 w-auto" />
          <button 
            onClick={() => setIsMobileMenuOpen?.(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="px-6 py-8">
          <div className="space-y-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              if (item.onClick) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-green' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen?.(false)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-green' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        {renderDesktopSidebar()}
      </div>

      {/* Mobile Sidebar */}
      {renderMobileSidebar()}
    </>
  );
};

export default UserProfileSidebar;