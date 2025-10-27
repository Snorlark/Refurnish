"use client";
import { createContext, useContext, ReactNode } from 'react';
import { useWishlist, WishlistItem } from '../hooks/useWishlist';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string | number) => void;
  isInWishlist: (productId: string | number) => boolean;
  toggleWishlist: (product: any) => void;
  clearWishlist: () => void;
  wishlistCount: number;
  isBackendAvailable: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const wishlist = useWishlist();
  
  return (
    <WishlistContext.Provider value={wishlist}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
