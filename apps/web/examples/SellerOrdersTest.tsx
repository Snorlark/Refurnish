"use client";

import React from 'react';
import { useSellerOrders } from '../hooks/useSellerOrders';
import { useAuth } from '../contexts/AuthContext';

const SellerOrdersTest: React.FC = () => {
  const { orders, isLoading, error, isBackendHealthy, updateOrderStatus } = useSellerOrders();
  const { user } = useAuth();

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  if (!user || user.role !== 'seller') {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Seller Access Required</h2>
        <p className="text-yellow-700">You need to be logged in as a seller to test this functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Seller Orders Test</h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure you have products listed in your seller dashboard</li>
          <li>Have another user place an order containing your products</li>
          <li>Check that the order appears in this test component</li>
          <li>Test updating the order status</li>
          <li>Verify that products are marked as "sold" when status is "To Rate"</li>
        </ol>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Backend Status:</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          isBackendHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isBackendHealthy ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            No orders containing your products were found. 
            This could mean:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
            <li>You don't have any products listed</li>
            <li>No customers have ordered your products yet</li>
            <li>There's an issue with the backend connection</li>
          </ul>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Your Orders ({orders.length})</h3>
          {orders.map((order) => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">Order #{order.orderId}</h4>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'Preparing to Ship' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'To Ship' ? 'bg-orange-100 text-orange-800' :
                  order.status === 'Shipped out' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'To Rate' ? 'bg-green-100 text-green-800' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-3">
                <h5 className="font-medium mb-2">Items:</h5>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <span>{item.name} (Qty: {item.quantity})</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm mb-3">
                <span>Total: ₱{order.totalAmount.toFixed(2)}</span>
                {order.trackingNumber && (
                  <span>Tracking: {order.trackingNumber}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(order.orderId, 'To Ship')}
                  className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                >
                  To Ship
                </button>
                <button
                  onClick={() => handleStatusUpdate(order.orderId, 'Shipped out')}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Shipped Out
                </button>
                <button
                  onClick={() => handleStatusUpdate(order.orderId, 'Out for Delivery')}
                  className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                >
                  Out for Delivery
                </button>
                <button
                  onClick={() => handleStatusUpdate(order.orderId, 'To Rate')}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  To Rate (Mark as Sold)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrdersTest;
