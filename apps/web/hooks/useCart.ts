"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface CartItem {
  id: string | number;
  name: string;
  price: string;
  priceNum: number;
  location: string;
  image: string;
  category: string;
  quantity: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const { user, token } = useAuth();

  // Local storage fallback functions
  const loadCartFromLocalStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        setCartItems(items);
        setCartCount(items.reduce((total: number, item: CartItem) => total + item.quantity, 0));
      }
    } catch (error) {
      console.error('Error loading cart from local storage:', error);
    }
  }, []);

  const saveCartToLocalStorage = useCallback((items: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to local storage:', error);
    }
  }, []);

  const loadCartFromBackend = useCallback(async () => {
    if (!token) {
      console.log('No token available, skipping cart load');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/carts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const cart = await response.json();
        // Handle empty cart or missing items array
        const items = cart.items && Array.isArray(cart.items) ? cart.items : [];
        const mappedItems = items.map((item: any) => ({
          id: item.productId,
          name: item.name,
          price: `₱${item.price.toLocaleString()}`,
          priceNum: item.price,
          location: item.location || '',
          image: item.image || '',
          category: item.category || '',
          quantity: item.quantity
        }));
        setCartItems(mappedItems);
        setCartCount(mappedItems.reduce((total: number, item: CartItem) => total + item.quantity, 0));
      } else if (response.status === 500) {
        // Handle 500 errors gracefully - likely empty cart or server issue
        console.warn('Server error loading cart, initializing empty cart:', response.status, response.statusText);
        setCartItems([]);
        setCartCount(0);
        // Don't set backend as unavailable for 500 errors, just initialize empty cart
      } else {
        console.error('Failed to load cart:', response.status, response.statusText);
        setIsBackendAvailable(false);
        // Fallback to local storage
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage
      loadCartFromLocalStorage();
    }
  }, [token, loadCartFromLocalStorage]);

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadCartFromBackend();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      setCartCount(0);
      // Also clear local storage
      localStorage.removeItem('cart');
    }
  }, [user, token, loadCartFromBackend]);

  // Load from local storage on mount if no user
  useEffect(() => {
    if (!user) {
      loadCartFromLocalStorage();
    }
  }, [user, loadCartFromLocalStorage]);

  // Initialize empty cart if cartItems is undefined or null
  useEffect(() => {
    if (cartItems === undefined || cartItems === null) {
      setCartItems([]);
      setCartCount(0);
    }
  }, [cartItems]);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      setIsBackendAvailable(isHealthy);
      if (!isHealthy) {
        console.log('Backend is not available, using local storage fallback');
      }
    };
    checkHealth();
  }, []);

  const getCartCount = async () => {
    if (!user || !token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/carts/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count);
      } else {
        console.error('Failed to get cart count:', response.status, response.statusText);
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error getting cart count:', error);
      setCartCount(0);
    }
  };

  const addToCart = async (product: any, useLocalStorage = false) => {
    const cartItem: CartItem = {
      id: product.id.toString(),
      name: product.name,
      price: `₱${product.priceNum.toLocaleString()}`,
      priceNum: product.priceNum,
      location: product.location || '',
      image: product.image || '',
      category: product.category || '',
      quantity: 1
    };

    // If backend is not available, user not authenticated, or explicitly using local storage
    if (!isBackendAvailable || !user || !token || useLocalStorage) {
      const existingItemIndex = cartItems.findIndex(item => item.id === cartItem.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += 1;
        setCartItems(updatedItems);
        setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
        saveCartToLocalStorage(updatedItems);
      } else {
        // Add new item
        const updatedItems = [...cartItems, cartItem];
        setCartItems(updatedItems);
        setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
        saveCartToLocalStorage(updatedItems);
      }
      return;
    }

    try {
      const requestData = {
        productId: product.id.toString(),
        quantity: 1,
        price: product.priceNum,
        name: product.name,
        image: product.image,
        location: product.location,
        category: product.category
      };
      
      console.log('Sending cart request:', requestData);
      console.log('Product object:', product);
      
      const response = await fetch(`${API_BASE_URL}/api/carts/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        // Reload cart from backend
        await loadCartFromBackend();
      } else {
        const errorData = await response.text();
        console.error('Failed to add item to cart:', response.status, response.statusText);
        console.error('Error response:', errorData);
        setIsBackendAvailable(false);
        // Fallback to local storage - prevent infinite recursion
        addToCart(product, true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage - prevent infinite recursion
      addToCart(product, true);
    }
  };

  const removeFromCart = async (productId: string | number, useLocalStorage = false) => {
    // If backend is not available, user not authenticated, or explicitly using local storage
    if (!isBackendAvailable || !user || !token || useLocalStorage) {
      const updatedItems = cartItems.filter(item => item.id !== productId);
      setCartItems(updatedItems);
      setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
      saveCartToLocalStorage(updatedItems);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/carts/item/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Reload cart from backend
        await loadCartFromBackend();
      } else {
        console.error('Failed to remove item from cart');
        setIsBackendAvailable(false);
        // Fallback to local storage - prevent infinite recursion
        removeFromCart(productId, true);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage - prevent infinite recursion
      removeFromCart(productId, true);
    }
  };

  const updateQuantity = async (productId: string | number, quantity: number, useLocalStorage = false) => {
    // If backend is not available, user not authenticated, or explicitly using local storage
    if (!isBackendAvailable || !user || !token || useLocalStorage) {
      const updatedItems = cartItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0);
      setCartItems(updatedItems);
      setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
      saveCartToLocalStorage(updatedItems);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/carts/item/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        // Reload cart from backend
        await loadCartFromBackend();
      } else {
        console.error('Failed to update item quantity');
        setIsBackendAvailable(false);
        // Fallback to local storage - prevent infinite recursion
        updateQuantity(productId, quantity, true);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage - prevent infinite recursion
      updateQuantity(productId, quantity, true);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // Use priceNum if available, otherwise parse the price string
      const price = item.priceNum || parseFloat(item.price.replace(/[₱,\s]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const clearCart = async (useLocalStorage = false) => {
    // If backend is not available, user not authenticated, or explicitly using local storage
    if (!isBackendAvailable || !user || !token || useLocalStorage) {
      setCartItems([]);
      setCartCount(0);
      saveCartToLocalStorage([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/carts/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCartItems([]);
        setCartCount(0);
      } else {
        console.error('Failed to clear cart');
        setIsBackendAvailable(false);
        // Fallback to local storage - prevent infinite recursion
        clearCart(true);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setIsBackendAvailable(false);
      // Fallback to local storage - prevent infinite recursion
      clearCart(true);
    }
  };

  // Function to refresh cart after successful checkout (only removes ordered items)
  const refreshCartAfterCheckout = useCallback(async () => {
    if (user && token) {
      // Reload cart from backend to get updated state (backend removes only ordered items)
      await loadCartFromBackend();
    } else {
      // Clear local cart if user is not authenticated
      setCartItems([]);
      setCartCount(0);
      saveCartToLocalStorage([]);
    }
  }, [user, token, loadCartFromBackend, saveCartToLocalStorage]);

  // Function to remove specific items from cart after successful checkout
  const removeOrderedItemsFromCart = useCallback(async (orderedItemIds: string[]) => {
    if (user && token) {
      // Reload cart from backend to get updated state (backend already removed ordered items)
      await loadCartFromBackend();
    } else {
      // Remove ordered items from local cart
      const updatedItems = cartItems.filter(item => 
        !orderedItemIds.includes(item.id.toString())
      );
      setCartItems(updatedItems);
      setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
      saveCartToLocalStorage(updatedItems);
    }
  }, [user, token, cartItems, loadCartFromBackend, saveCartToLocalStorage]);

  // Function to clear cart completely (for admin purposes or full cart clearing)
  const clearCartAfterCheckout = useCallback(async () => {
    try {
      // First try to clear from backend
      if (user && token && isBackendAvailable) {
        const response = await fetch(`${API_BASE_URL}/api/carts/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('Cart cleared from backend successfully');
        } else {
          console.warn('Failed to clear cart from backend, clearing locally');
        }
      }
    } catch (error) {
      console.warn('Error clearing cart from backend, clearing locally:', error);
    } finally {
      // Always clear local state
      setCartItems([]);
      setCartCount(0);
      saveCartToLocalStorage([]);
    }
  }, [user, token, isBackendAvailable, saveCartToLocalStorage]);

  return {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
    cartCount,
    getCartCount,
    isBackendAvailable,
    refreshCart: loadCartFromBackend,
    refreshCartAfterCheckout,
    removeOrderedItemsFromCart,
    clearCartAfterCheckout
  };
}