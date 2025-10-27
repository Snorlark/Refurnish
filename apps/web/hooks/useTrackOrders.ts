import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  location?: string;
  category?: string;
}

export interface TrackOrder {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  status: 'Preparing to Ship' | 'Shipped out' | 'Out for Delivery' | 'Delivered' | 'To Rate' | 'Cancelled';
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

interface PlaceOrderData {
  selectedItems: string[];
  shippingAddress: string;
  notes?: string;
}

interface PlaceOrderOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Health check function
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log('Backend health check failed:', error);
    return false;
  }
};

export function useTrackOrders() {
  const [orders, setOrders] = useState<TrackOrder[]>([]);
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

  // Fetch user's orders
  const fetchOrders = useCallback(async () => {
    if (!token || !user) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  // Place a new order
  const placeOrder = useCallback(async (orderData: PlaceOrderData, options?: PlaceOrderOptions) => {
    if (!token || !user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to place order: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh orders after placing a new one
      await fetchOrders();
      
      // Call success callback if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      return result;
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order');
      
      // Call error callback if provided
      if (options?.onError && err instanceof Error) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, user, fetchOrders]);

  // Get specific order by ID
  const getOrderById = useCallback(async (orderId: string) => {
    if (!token || !user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error fetching order:', err);
      throw err;
    }
  }, [token, user]);

  // Fetch orders when component mounts or user changes
  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [user, token, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    isBackendHealthy,
    fetchOrders,
    placeOrder,
    getOrderById,
  };
}
