"use client";
import React from 'react';
import SellerDashboardPage from '../../seller-dashboard/page';
import { useAuth } from '../../../contexts/AuthContext';

export default function SellerDashboardAccessPage() {
  const { user } = useAuth();
  if (user?.role !== 'seller') {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1200px] mx-auto py-6">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Dashboard</h2>
            <p className="text-gray-600 mb-4">You need to be a seller to access this dashboard.</p>
            <a 
              className="inline-flex items-center px-4 py-2 bg-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors" 
              href="/profile/seller-registration"
            >
              Complete Seller Registration
            </a>
          </div>
        </div>
      </div>
    );
  }
  return (
    
    <div className="px-0">
      <SellerDashboardPage embedded />
    </div>
  );
}


