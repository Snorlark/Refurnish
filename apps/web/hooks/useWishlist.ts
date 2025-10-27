"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface WishlistItem {
  id: string | number;
  name: string;
  price: string;
  priceNum: number;
  location: string;
  image: string;
  category: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

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

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const { user, token } = useAuth();

  // Local storage fallback functions
  const loadWishlistFromLocalStorage = useCallback(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist);
        setWishlistItems(items);
        setWishlistCount(items.length);
      }
    } catch (error) {
      console.error('Error loading wishlist from local storage:', error);
    }
  }, []);

  const saveWishlistToLocalStorage = useCallback((items: WishlistItem[]) => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist to local storage:', error);
    }
  }, []);

  const loadWishlistFromBackend = useCallback(async () => {
    if (!token) {
      console.log('No token available, skipping wishlist load');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlists`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const wishlist = await response.json();
        const items = wishlist.items.map((item: any) => ({
          id: item.productId,
          name: item.name,
          price: `₱${item.price.toLocaleString()}`,
          priceNum: item.price,
          location: item.location || '',
          image: item.image || '',
          category: item.category || ''
        }));
        setWishlistItems(items);
        setWishlistCount(items.length);
      } else {
        console.error('Failed to load wishlist:', response.status, response.statusText);
        setIsBackendAvailable(false);
        // Fallback to local storage
        loadWishlistFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading wishlist from backend:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage
      loadWishlistFromLocalStorage();
    }
  }, [token, loadWishlistFromLocalStorage]);

  // Load wishlist from backend when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadWishlistFromBackend();
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
      setWishlistCount(0);
      // Also clear local storage
      localStorage.removeItem('wishlist');
    }
  }, [user, token, loadWishlistFromBackend]);

  // Load from local storage on mount if no user
  useEffect(() => {
    if (!user) {
      loadWishlistFromLocalStorage();
    }
  }, [user, loadWishlistFromLocalStorage]);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      setIsBackendAvailable(isHealthy);
      if (!isHealthy) {
        console.log('Backend is not available, using local storage fallback for wishlist');
      }
    };
    checkHealth();
  }, []);

  const addToWishlist = async (product: any) => {
    const wishlistItem: WishlistItem = {
      id: product.id.toString(),
      name: product.name,
      price: `₱${product.priceNum.toLocaleString()}`,
      priceNum: product.priceNum,
      location: product.location || '',
      image: product.image || '',
      category: product.category || ''
    };

    // If backend is not available or user not authenticated, use local storage
    if (!isBackendAvailable || !user || !token) {
      const existingItemIndex = wishlistItems.findIndex(item => item.id === wishlistItem.id);
      
      if (existingItemIndex > -1) {
        // Item already exists, don't add again
        return;
      }

      // Add new item
      const updatedItems = [...wishlistItems, wishlistItem];
      setWishlistItems(updatedItems);
      setWishlistCount(updatedItems.length);
      saveWishlistToLocalStorage(updatedItems);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlists/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id.toString(),
          name: product.name,
          price: product.priceNum,
          image: product.image,
          location: product.location,
          category: product.category
        }),
      });

      if (response.ok) {
        // Reload wishlist from backend
        await loadWishlistFromBackend();
      } else {
        console.error('Failed to add item to wishlist:', response.status, response.statusText);
        setIsBackendAvailable(false);
        // Fallback to local storage
        addToWishlist(product); // This will now use local storage
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage
      addToWishlist(product); // This will now use local storage
    }
  };

  const removeFromWishlist = async (productId: string | number) => {
    // If backend is not available or user not authenticated, use local storage
    if (!isBackendAvailable || !user || !token) {
      const updatedItems = wishlistItems.filter(item => item.id !== productId);
      setWishlistItems(updatedItems);
      setWishlistCount(updatedItems.length);
      saveWishlistToLocalStorage(updatedItems);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlists/item/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Reload wishlist from backend
        await loadWishlistFromBackend();
      } else {
        console.error('Failed to remove item from wishlist');
        setIsBackendAvailable(false);
        // Fallback to local storage
        removeFromWishlist(productId); // This will now use local storage
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage
      removeFromWishlist(productId); // This will now use local storage
    }
  };

  const isInWishlist = (productId: string | number) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const toggleWishlist = async (product: any) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const clearWishlist = async () => {
    // If backend is not available or user not authenticated, use local storage
    if (!isBackendAvailable || !user || !token) {
      setWishlistItems([]);
      setWishlistCount(0);
      saveWishlistToLocalStorage([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlists/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setWishlistItems([]);
        setWishlistCount(0);
      } else {
        console.error('Failed to clear wishlist');
        setIsBackendAvailable(false);
        // Fallback to local storage
        clearWishlist(); // This will now use local storage
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage
      clearWishlist(); // This will now use local storage
    }
  };

  return {
    wishlistItems,
    isWishlistOpen,
    setIsWishlistOpen,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount,
    isBackendAvailable
  };
}