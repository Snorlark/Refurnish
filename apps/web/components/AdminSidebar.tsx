"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, PackageCheck, Users, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

interface AdminSidebarProps {
  activePage: 'dashboard' | 'user-management' | 'seller-management' | 'product-moderation' | 'content-management';
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePage }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['user-management']));

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
      } else {
        newSet.add(itemLabel);
      }
      return newSet;
    });
  };

  const navItems = [
    { 
      label: 'Dashboard Overview', 
      href: '/admin/dashboard', 
      active: activePage === 'dashboard', 
      icon: <LayoutDashboard className="w-5 h-5 text-gray-500" />,
      hasSubItems: false
    },
    { 
      label: 'User Management', 
      href: '/admin/user-management', 
      active: activePage === 'user-management', 
      icon: <Users className="w-5 h-5 text-gray-500" />,
      hasSubItems: true,
      subItems: [
        { label: 'All Users', href: '/admin/user-management', active: activePage === 'user-management' },
        { label: 'Seller Management', href: '/admin/seller-management', active: activePage === 'seller-management' }
      ]
    },
    { 
      label: 'Product Moderation', 
      href: '/admin/product-moderation', 
      active: activePage === 'product-moderation', 
      icon: <PackageCheck className="w-5 h-5 text-gray-500" />,
      hasSubItems: false
    },
    { 
      label: 'Content Management', 
      href: '/admin/content-management', 
      active: activePage === 'content-management', 
      icon: <Settings className="w-5 h-5 text-gray-500" />,
      hasSubItems: false
    },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-80 bg-white shadow-sm">
      <div className="w-80 bg-white shadow-sm h-screen flex flex-col">
        <div className="p-6 border-b flex-grow">
          {/* Header with Notification Bell */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src="/Rf-logo.svg" alt="Rf" width={40} height={40} />
              </div>
              <span className="text-lg font-medium text-gray-700">Admin Access</span>
            </div>
            
            {/* Notification Bell - Top Right */}
            <NotificationBell />
          </div>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#636B2F] rounded-full flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <Image 
                  src={user.profilePicture} 
                  alt={`${user.firstName} ${user.lastName}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    const nextElement = target.nextElementSibling as HTMLElement;
                    target.style.display = 'none';
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={`${user?.profilePicture ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-white font-semibold text-lg`}>
                {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm text-gray-500">Administrator</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8">
            <div className="px-2">
              <div className="px-4 text-xs font-medium tracking-wider text-gray-500 mb-3">NAVIGATION</div>
              
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <div
                      className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
                        item.active 
                          ? 'bg-gray-100 text-gray-900 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (item.hasSubItems) {
                          toggleExpanded(item.label);
                        } else {
                          router.push(item.href);
                        }
                      }}
                    >
                      <span className="w-4 h-4">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.hasSubItems && (
                        <span className="w-4 h-4">
                          {expandedItems.has(item.label) ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </span>
                      )}
                    </div>
                    
                    {/* Sub-items */}
                    {item.hasSubItems && expandedItems.has(item.label) && (
                      <div className="flex flex-col gap-2 ml-6 space-y-1 mt-1">
                        {/* Divider */}                        
                        {item.subItems?.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 ${
                              subItem.active
                                ? 'bg-(--color-olive) text-white font-medium border-l-2 border-(--color-olive)'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                          
                        ))}
                         
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>
        
        <div className="p-6 border-t border-gray-200 mt-auto">
          <button 
            onClick={logout} 
            className="w-full cursor-pointer flex items-center justify-start gap-2 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
