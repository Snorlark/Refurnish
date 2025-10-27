"use client";
import { CartItem } from '../hooks/useCart'
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  totalPrice: number;
  isBackendAvailable?: boolean;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
  isBackendAvailable = true
}: CartSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-black">Shopping Cart</h2>
            {!isBackendAvailable && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-orange-600">Offline Mode</span>
              </div>
            )}
          </div>
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
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium text-black text-sm">{item.name}</h3>
                    <p className="text-black font-semibold">{item.price}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 text-black flex items-center justify-center hover:bg-gray-300 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="text-black font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 text-black flex items-center justify-center hover:bg-gray-300 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
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
        
        {cartItems.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-black">Total:</span>
              <span className="text-lg font-bold text-black">₱ {totalPrice.toLocaleString()}</span>
            </div>
            <button className="w-full bg-green-900 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition-colors">
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}