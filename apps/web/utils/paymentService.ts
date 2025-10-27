// Payment service utility for backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface PaymentRequest {
  amount: number;
  provider: 'gcash' | 'paymaya';
  mobileNumber?: string;
  orderId?: string;
  userId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  message?: string;
  redirectUrl?: string;
}

export class PaymentService {
  /**
   * Process payment through backend
   */
  static async processPayment(
    paymentData: PaymentRequest,
    token?: string
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(
    transactionId: string,
    token?: string
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Create payment intent (for GCash/PayMaya integration)
   */
  static async createPaymentIntent(
    amount: number,
    provider: 'gcash' | 'paymaya',
    token?: string
  ): Promise<{ paymentIntentId: string; redirectUrl?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ amount, provider }),
      });

      if (!response.ok) {
        throw new Error(`Payment intent creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }
}

// Mock payment processing for development/testing
export const mockPaymentProcessing = async (
  amount: number,
  provider: 'gcash' | 'paymaya',
  mobileNumber?: string
): Promise<PaymentResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate success/failure based on amount (for testing)
  const success = amount > 0 && amount < 100000; // Mock validation

  return {
    success,
    transactionId: `txn_${Date.now().toString(36).slice(-8)}`,
    status: success ? 'COMPLETED' : 'FAILED',
    message: success 
      ? `Payment of ₱${amount.toLocaleString()} via ${provider} completed successfully`
      : 'Payment failed. Please try again.',
  };
};
