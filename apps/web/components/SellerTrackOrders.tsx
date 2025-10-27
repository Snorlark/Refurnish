"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useSellerOrders, SellerOrder } from '../hooks/useSellerOrders';
import { useAuth } from '../contexts/AuthContext';

interface SellerTrackOrdersProps {
  onClose?: () => void;
}

const SellerTrackOrders: React.FC<SellerTrackOrdersProps> = ({ onClose }) => {
  const { orders, isLoading, error, isBackendHealthy, updateOrderStatus } = useSellerOrders();
  const { user } = useAuth();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  const statusOptions = [
    { value: 'Preparing to Ship', label: 'Preparing to Ship', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'To Ship', label: 'To Ship', color: 'bg-orange-100 text-orange-800' },
    { value: 'Shipped out', label: 'Shipped out', color: 'bg-blue-100 text-blue-800' },
    { value: 'Out for Delivery', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
    { value: 'To Rate', label: 'To Rate', color: 'bg-green-100 text-green-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdatingOrderId(selectedOrder._id);
    try {
      await updateOrderStatus(selectedOrder.orderId, newStatus, trackingNumber);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openStatusModal = (order: SellerOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setShowStatusModal(true);
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  if (!isBackendHealthy) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Backend Unavailable</h3>
          <p className="text-gray-500 mb-6">Unable to connect to the server. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading orders...</h3>
          <p className="text-gray-500">Please wait while we fetch your orders</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-6 py-3 bg-[#636B2F] text-white rounded-full hover:bg-[#4A5A2A] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Orders for your products will appear here when customers make purchases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Orders</h2>
        <p className="text-gray-600">Manage and update the status of orders containing your products</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <button
                  onClick={() => openStatusModal(order)}
                  disabled={updatingOrderId === order._id}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingOrderId === order._id ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No Image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × ₱{item.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Location: {item.location || 'Not specified'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₱{(order.totalAmount - order.shippingFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>₱{order.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span>₱{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm">
                  <span className="font-medium">Tracking Number:</span>
                  <span className="ml-2 font-mono">{order.trackingNumber}</span>
                </p>
              </div>
            )}

            {order.shippingAddress && (
              <div className="mt-2">
                <p className="text-sm">
                  <span className="font-medium">Shipping Address:</span>
                  <span className="ml-2 text-gray-600">{order.shippingAddress}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingOrderId === selectedOrder._id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingOrderId === selectedOrder._id ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerTrackOrders;
