// Example usage of PaymentMockupModal
import React, { useState } from 'react';
import PaymentMockupModal from '../components/PaymentMockupModal';

export default function PaymentModalExample() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1500);
  const [paymentProvider, setPaymentProvider] = useState<'gcash' | 'paymaya'>('gcash');

  const handlePaymentSuccess = (result: { status: "SOLD"; txnId: string; amount: number }) => {
    console.log('Payment successful:', result);
    // Here you would typically:
    // 1. Update order status in your backend
    // 2. Clear the cart
    // 3. Redirect to success page
    // 4. Send confirmation email
    
    alert(`Payment successful! Transaction ID: ${result.txnId}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Payment Modal Example</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount (PHP)</label>
          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 w-48"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Payment Provider</label>
          <select
            value={paymentProvider}
            onChange={(e) => setPaymentProvider(e.target.value as 'gcash' | 'paymaya')}
            className="border border-gray-300 rounded-md px-3 py-2 w-48"
          >
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
          </select>
        </div>
        
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Open Payment Modal
        </button>
      </div>

      <PaymentMockupModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={paymentAmount}
        provider={paymentProvider}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
