"use client";
import { WishlistItem } from '../hooks/useWishlist'

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: WishlistItem[];
  onRemoveItem: (productId: number) => void;
  onAddToCart: (product: any) => void;
}

export default function WishlistSidebar({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveItem,
  onAddToCart
}: WishlistSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-black">Wishlist</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {wishlistItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium text-black text-sm">{item.name}</h3>
                    <p className="text-black font-semibold">{item.price}</p>
                    <button 
                      onClick={() => onAddToCart(item)}
                      className="mt-2 bg-green-900 text-white px-3 py-1 rounded text-xs hover:bg-green-800 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}