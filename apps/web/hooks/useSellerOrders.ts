"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface SellerOrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  location?: string;
  category?: string;
}

export interface SellerOrder {
  _id: string;
  orderId: string;
  userId: string;
  items: SellerOrderItem[];
  status: 'Preparing to Ship' | 'To Ship' | 'Shipped out' | 'Out for Delivery' | 'To Rate' | 'Cancelled' | 'Sold';
  totalAmount: number;
  shippingFee: number;
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Try to fetch a simple endpoint to check if backend is available
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export function useSellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const { token, user } = useAuth();

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await checkBackendHealth();
      setIsBackendHealthy(healthy);
    };
    checkHealth();
  }, []);

  // Fetch seller's orders
  const fetchSellerOrders = useCallback(async () => {
    if (!token || !user) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/seller/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch seller orders: ${response.statusText}`);
      }

      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching seller orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch seller orders');
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: string, trackingNumber?: string) => {
    if (!token || !user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/seller/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, trackingNumber }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh orders after successful update
      await fetchSellerOrders();
      
      return result;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }, [token, user, fetchSellerOrders]);

  // Fetch orders when component mounts or user changes
  useEffect(() => {
    if (user && token && user.role === 'seller') {
      fetchSellerOrders();
    }
  }, [user, token, fetchSellerOrders]);

  return {
    orders,
    isLoading,
    error,
    isBackendHealthy,
    fetchSellerOrders,
    updateOrderStatus,
  };
}
