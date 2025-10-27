import React, { useEffect, useState } from "react";
import Image from "next/image";
import { mockPaymentProcessing } from "../utils/paymentService";
// import { PaymentService } from "../utils/paymentService"; // For production backend integration

interface PaymentMockupModalProps {
  open: boolean;
  onClose: () => void;
  amount: number | string;
  provider?: "gcash" | "paymaya" | string; // optional, default 'gcash'
  txnId?: string;
  onSuccess?: (result: { status: "SOLD"; txnId: string; amount: number }) => void;
}

export default function PaymentMockupModal({
  open,
  onClose,
  amount,
  provider = "gcash",
  txnId,
  onSuccess,
}: PaymentMockupModalProps) {
  // safe parse amount -> number
  const parsedAmount = Number(String(amount).replace(/[^0-9.-]+/g, "")) || 0;

  const formatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  });

  // fallback txn id if none provided
  const id = txnId || `txn_${Date.now().toString(36).slice(-8)}`;

  // Image paths (adjust as needed)
  const paymayaQrMock = "/icon/maya.jpg"; // QR illustration for PayMaya
  const gcashLogo = "/icon/gcash.png"; // optional small logos
  const paymayaLogo = "/icon/pmaya.png";

  const [step, setStep] = useState<"login" | "confirm">("login");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [refId, setRefId] = useState(txnId || `txn_${Date.now().toString(36).slice(-8)}`);
  const [isProcessing, setIsProcessing] = useState(false);

  // simple focus management: focus first input when modal opens
  useEffect(() => {
    if (open && step === "login") {
      const input = document.querySelector<HTMLInputElement>("#payment-mockup-first-input");
      if (input) input.focus();
    }
    // lock scroll on body while modal open
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, step]);

  // don't render when closed
  if (!open) return null;

  const isPhoneValid = () => {
    const digits = mobile.replace(/\D/g, "");
    // assume local PH mobile w/o +63 is 10 digits (e.g., 9123456789)
    return digits.length === 10;
  };

  function handleNext() {
    if (!isPhoneValid()) {
      setError("Please enter a valid 10-digit mobile number (without +63).");
      return;
    }
    // generate a new ref id for the confirmation screen (or reuse txnId)
    const newRef = txnId || `ref_${Date.now().toString(36).slice(-8)}`;
    setRefId(newRef);
    setStep("confirm");
  }

  async function handleProceed() {
    setIsProcessing(true);
    
    try {
      // Use mock payment processing for development
      // Replace with PaymentService.processPayment for production
      const paymentResult = await mockPaymentProcessing(
        parsedAmount,
        provider as 'gcash' | 'paymaya',
        mobile
      );

      if (paymentResult.success) {
        // call onSuccess with payload so parent can close checkout & update status
        if (typeof onSuccess === "function") {
          onSuccess({ 
            status: "SOLD", 
            txnId: paymentResult.transactionId, 
            amount: parsedAmount 
          });
        }
      } else {
        setError(paymentResult.message || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setError("Payment processing failed. Please try again.");
      setIsProcessing(false);
      return;
    }
    
    // close the payment modal itself
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-8"
      role="presentation"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Payment mockup dialog"
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        {/* Close */}
        <button
          aria-label="Close payment dialog"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 size-9 rounded-full hover:bg-neutral-100 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Provider: GCash */}
        {provider === "gcash" && (
          <>
            <div className="bg-blue-600 h-36 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-3">
                  <Image
                    src={gcashLogo}
                    alt="GCash Logo"
                    width={32}
                    height={32}
                    className="h-8 w-auto"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <h2 className="text-white text-3xl font-bold">GCash</h2>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-auto">
              {step === "login" && (
                <div className="rounded-md bg-white shadow-xl border-b border-gray-200">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>Merchant</div>
                      <div className="font-medium text-gray-800">Refurnish</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-500">Amount Due</div>
                      <div className="text-lg font-semibold text-blue-500">
                        {formatter.format(parsedAmount)}
                      </div>
                    </div>
          </div>

                  <div className="p-6">
                    <h3 className="text-center text-gray-700 font-semibold mb-4">
                      Login to pay with GCash
          </h3>
                    {error && (
                      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm" role="alert" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
                        {error}
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-200">
                        <span className="px-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 select-none">+63</span>
                        <input
                          id="payment-mockup-first-input"
                          type="tel"
                          inputMode="numeric"
                          placeholder="Mobile number"
                          maxLength={10}
                          className="w-full px-4 py-3 text-sm outline-none"
                          value={mobile}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            if (error) setError("");
                            setMobile(digits);
                          }}
                          onKeyDown={(e) => {
                            const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
                            if (allowed.includes(e.key)) return;
                            if (!/^[0-9]$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pasted = (e.clipboardData || (window as any).clipboardData).getData('text');
                            const digits = String(pasted).replace(/\D/g, '').slice(0, 10);
                            setMobile((prev) => (prev + digits).slice(0, 10));
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enter mobile number without the leading zero. e.g. <i>9123456789</i>
                      </p>
                    </div>

                    <button onClick={handleNext} className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold">
                      NEXT
                    </button>
                  </div>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have a GCash account?{" "}
                    <a href="#" className="text-blue-200 underline">
                      Register now
                    </a>
                  </div>
                </div>
              )}

              {step === "confirm" && (
                <div className="rounded-md bg-white shadow-xl border-b border-gray-200 p-4">
                  <div className="p-2 border-b border-gray-200 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>Merchant</div>
                      <div className="font-medium text-gray-800">Refurnish</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-500">Amount Due</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatter.format(parsedAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Confirm card showing total, ref id, and proceed */}
                  <div className="bg-white p-6 rounded-md shadow-inner text-center">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-lg font-semibold">{formatter.format(parsedAmount)}</div>
                    </div>

                    <div className="mb-4 text-sm text-gray-600">Reference No.</div>
                    <div className="mb-4 font-mono text-sm text-gray-800">{refId}</div>

                    {isProcessing ? (
                      <div className="space-y-4">
                        <div className="w-8 h-8 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-600">Processing payment...</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleProceed}
                        className="w-full py-3 rounded-full bg-blue-600 text-white font-semibold"
                      >
                        Proceed
                      </button>
                    )}
                  </div>

                  <div className="mt-4 text-sm text-gray-500 text-center">
                    {isProcessing ? "Processing your payment..." : "Redirecting you back to merchant after proceed..."}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Provider: PayMaya (QR) */}
        {provider === "paymaya" && (
          <>
            <div className="bg-white h-20 flex items-center justify-center border-gray-200 border-b">
              <div className="flex items-center gap-3">
                <Image
                  src={paymayaLogo}
                  alt="Maya Logo"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            </div>

            <div className="p-6 overflow-auto">
              <div className="max-w-md mx-auto bg-white p-4 rounded-lg shadow-xl border-b border-gray-100">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>Merchant</div>
                    <div className="font-medium text-gray-800">Refurnish</div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-lg font-semibold">
                      {formatter.format(parsedAmount)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {/* QR image (replace with real QR if you have one) */}
                  <Image
                    src={paymayaQrMock}
                    alt="PayMaya QR"
                    width={192}
                    height={192}
                    className="w-48 h-48 object-contain rounded-md border p-2 bg-white"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />

                  <div className="text-sm text-gray-600 text-center">
                    <div>
                      Txn ID: <span className="font-medium">{id}</span>
                    </div>
                    <div className="mt-2 text-gray-500">
                      Scan this code with your bank or e-wallet app to pay.
            </div>
          </div>

          {isProcessing ? (
                    <div className="space-y-4 w-full">
              <div className="w-8 h-8 mx-auto border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Processing payment...</p>
            </div>
          ) : (
                    <button onClick={handleProceed} className="w-full mt-3 py-3 rounded-full bg-green-600 text-white font-semibold">
                      PROCEED TO MERCHANT
              </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fallback for other providers */}
        {!["gcash", "paymaya"].includes(provider) && (
          <div className="p-6">
            <div className="text-gray-700">
              Payment provider <strong>{String(provider)}</strong> is not supported by
              this mock modal.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}