"use client";
import React, { ReactNode, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import UserProfileSidebar from '../../components/UserProfileSidebar';
import NavbarMenu from '../../components/Navbar-Menu';
import LogoutModal from '../../components/LogoutModal';
import { Menu, ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleWishlistClick = () => {};
  const handleCartClick = () => {};

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <UserProfileSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onLogoutClick={handleLogoutClick}
        />

        {/* Custom Profile Navbar - Fixed at top */}
        <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(`/user-profile/${user?.email}`)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Your Profile</h1>
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

        {/* Content area with responsive left offset for desktop sidebar */}
        <div className="flex min-h-screen">
          <div className="flex-1 ml-0 md:ml-[300px] w-full">
            <div className="pt-16 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
        />
      </div>
    </ProtectedRoute>
  );
}


