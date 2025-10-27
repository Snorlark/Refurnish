"use client";
import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', children }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}>
      {children}
    </div>
  );
};

// Messages Skeleton Components
export const MessagesSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-3 h-3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Chat Messages Skeleton
export const ChatMessagesSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`px-3 py-2 rounded-2xl max-w-[85%] ${index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}`}>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Products Table Skeleton
export const ProductsTableSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: 7 }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {Array.from({ length: 7 }).map((_, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Chart Skeleton
export const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="h-80">
        <Skeleton className="w-full h-full rounded" />
      </div>
    </div>
  );
};

// Profile Card Skeleton
export const ProfileCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

// Generic Card Skeleton
export const CardSkeleton = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className={`h-4 ${index === lines - 1 ? 'w-1/2' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="w-6 h-6 rounded" />
    </div>
  );
};

// User Profile Skeleton
export const UserProfileSkeleton = () => {
  return (
    <div className="w-full">
      {/* Profile Info Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  
                  {/* Stats row */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 ml-6">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-24" />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <CardSkeleton lines={4} />
              <CardSkeleton lines={3} />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <CardSkeleton lines={2} />
              <CardSkeleton lines={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add custom CSS for the shimmer effect
const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-pulse {
  animation: shimmer 1.5s ease-in-out infinite;
}
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}

export default Skeleton;
