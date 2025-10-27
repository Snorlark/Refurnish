"use client";
import { createContext, useContext, ReactNode } from 'react';
import { useCart, CartItem } from '../hooks/useCart';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  getTotalPrice: () => number;
  clearCart: () => void;
  cartCount: number;
  getCartCount: () => void;
  isBackendAvailable: boolean;
  refreshCartAfterCheckout: () => Promise<void>;
  removeOrderedItemsFromCart: (orderedItemIds: string[]) => Promise<void>;
  clearCartAfterCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
