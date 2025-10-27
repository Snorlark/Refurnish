// Test component to verify cart clearing after checkout
import React, { useState } from 'react';
import { useCartContext } from '../contexts/CartContext';
import { useTrackOrders } from '../hooks/useTrackOrders';
import { useAuth } from '../contexts/AuthContext';

export default function CartClearingTest() {
  const { cartItems, cartCount, addToCart, refreshCartAfterCheckout } = useCartContext();
  const { placeOrder } = useTrackOrders();
  const { user } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);

  // Mock products for testing
  const mockProducts = [
    {
      id: 'test-1',
      name: 'Test Product 1',
      priceNum: 1000,
      location: 'Test Location',
      image: '/test1.jpg',
      category: 'test'
    },
    {
      id: 'test-2',
      name: 'Test Product 2',
      priceNum: 1500,
      location: 'Test Location',
      image: '/test2.jpg',
      category: 'test'
    },
    {
      id: 'test-3',
      name: 'Test Product 3',
      priceNum: 2000,
      location: 'Test Location',
      image: '/test3.jpg',
      category: 'test'
    }
  ];

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handlePlaceOrder = async (selectedItemIds: string[]) => {
    if (!user) {
      alert('Please log in to test order placement');
      return;
    }

    if (selectedItemIds.length === 0) {
      alert('Please select items to order');
      return;
    }

    setIsPlacingOrder(true);
    setOrderResult(null);

    try {
      await placeOrder({
        selectedItems: selectedItemIds,
        shippingAddress: 'Test Address',
        notes: 'Test order'
      }, {
        onSuccess: () => {
          // Refresh cart to remove only the ordered items
          refreshCartAfterCheckout();
          setOrderResult(`Order placed successfully! Only selected items (${selectedItemIds.join(', ')}) should be removed from cart.`);
        }
      });
    } catch (error) {
      console.error('Order placement failed:', error);
      setOrderResult(`Order failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cart Clearing Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Cart Status</h2>
          <p>Items in cart: {cartCount}</p>
          <p>Cart items: {cartItems.length}</p>
          {cartItems.length > 0 && (
            <div className="mt-2">
              <h3 className="font-medium">Items:</h3>
              <ul className="list-disc list-inside">
                {cartItems.map((item, index) => (
                  <li key={index}>
                    {item.name} - ₱{item.priceNum.toLocaleString()} (Qty: {item.quantity})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Add Products to Cart:</h3>
            <div className="flex gap-2 flex-wrap">
              {mockProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                >
                  Add {product.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Place Order (Selective):</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{item.name} - ₱{item.priceNum.toLocaleString()}</span>
                  <button
                    onClick={() => handlePlaceOrder([item.id.toString()])}
                    disabled={isPlacingOrder}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Order This Item
                  </button>
                </div>
              ))}
              {cartItems.length === 0 && (
                <p className="text-gray-500 text-sm">No items in cart. Add some products first.</p>
              )}
            </div>
          </div>
        </div>

        {orderResult && (
          <div className={`p-4 rounded-lg ${
            orderResult.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {orderResult}
          </div>
        )}

        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Test Instructions (Selective Cart Clearing):</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Add multiple products to cart using the "Add" buttons</li>
            <li>Verify cart count increases with each addition</li>
            <li>Click "Order This Item" for specific items to test selective ordering</li>
            <li>Verify only the ordered item is removed from cart</li>
            <li>Check that other items remain in the cart</li>
            <li>Repeat with different items to test selective removal</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
