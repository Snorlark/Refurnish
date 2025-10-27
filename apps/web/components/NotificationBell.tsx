"use client";
import React, { useState, useEffect } from 'react';
import { Bell, X, Users, Package, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminWebSocket } from '../hooks/useAdminWebSocket';

interface NotificationData {
  newSellerRequests: number;
  pendingProducts: number;
  pendingShopApprovals: number;
  totalNotifications: number;
}

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = "" }) => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData>({
    newSellerRequests: 0,
    pendingProducts: 0,
    pendingShopApprovals: 0,
    totalNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else if (response.status === 401) {
        // User is not admin, hide notifications
        setNotifications({
          newSellerRequests: 0,
          pendingProducts: 0,
          pendingShopApprovals: 0,
          totalNotifications: 0
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications({
        newSellerRequests: 0,
        pendingProducts: 0,
        pendingShopApprovals: 0,
        totalNotifications: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket for real-time notifications
  const { isConnected } = useAdminWebSocket({
    onNotificationUpdate: (data) => {
      console.log('Real-time notification update:', data);
      setNotifications(data);
    },
    onProductModerationUpdate: (data) => {
      console.log('Product moderation update:', data);
      // Refresh notifications when a product is moderated
      fetchNotifications();
    }
  });

  useEffect(() => {
    fetchNotifications();
    // Keep polling as fallback, but reduce frequency since we have WebSocket
    const interval = setInterval(fetchNotifications, 60000); // Every minute instead of 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  const notificationItems = [
    {
      icon: <Users className="w-4 h-4 text-blue-600" />,
      title: "New Seller Requests",
      count: notifications.newSellerRequests,
      description: "Users requesting seller status",
      href: "/admin/seller-management"
    },
    {
      icon: <Package className="w-4 h-4 text-orange-600" />,
      title: "Pending Products",
      count: notifications.pendingProducts,
      description: "Products awaiting approval",
      href: "/admin/product-moderation"
    },
    {
      icon: <Store className="w-4 h-4 text-green-600" />,
      title: "Shop Approvals",
      count: notifications.pendingShopApprovals,
      description: "Shop information changes pending",
      href: "/admin/seller-management"
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.totalNotifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {notifications.totalNotifications > 99 ? '99+' : notifications.totalNotifications}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 left-0 -translate-x-1/2 top-full  mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Items */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.totalNotifications === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No new notifications
                </div>
              ) : (
                <div className="py-2">
                  {notificationItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          {item.count > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {item.count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.totalNotifications > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Mark all as read functionality could be added here
                    setIsOpen(false);
                  }}
                  className="w-full text-xs text-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
