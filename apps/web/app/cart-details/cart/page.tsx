//hehe
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from '../../../components/Footer';
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useCartContext } from '../../../contexts/CartContext';
import { useTrackOrders } from '../../../hooks/useTrackOrders';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PaymentMockupModal from '../../../components/PaymentMockupModal';

type CartItem = {
  id: string | number;
  name: string;
  unitPrice: number;
  quantity: number;
  thumbnailSrc?: string;
  selected: boolean;
};


const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export default function CartPage() {
  const cart = useCartContext();
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [loadingItems, setLoadingItems] = useState<Set<string | number>>(new Set());
  

  // Convert cart hook items to local cart items with selection state
  const cartItems = useMemo(() => {
    return cart.cartItems.map(item => ({
      id: item.id,
      name: item.name,
      unitPrice: item.priceNum,
      quantity: item.quantity,
      thumbnailSrc: item.image,
      selected: selectedItems.has(item.id)
    }));
  }, [cart.cartItems, selectedItems]);

  const cartTotal = useMemo(() => {
    return cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cartItems]);

  const selectedItemsList = useMemo(() => cartItems.filter((i) => i.selected), [cartItems]);
  const shippingFee = selectedItemsList.length > 0 ? 150 : 0;
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  function toggleItemSelection(itemId: string | number) {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  async function incrementQuantity(itemId: string | number) {
    const item = cart.cartItems.find(item => item.id === itemId);
    if (item && !loadingItems.has(itemId)) {
      setLoadingItems(prev => new Set(prev).add(itemId));
      try {
        // Prevent incrementing beyond a reasonable limit
        const maxQuantity = 99;
        const newQuantity = Math.min(item.quantity + 1, maxQuantity);
        await cart.updateQuantity(itemId, newQuantity);
      } catch (error) {
        console.error('Error incrementing quantity:', error);
        // You could add a toast notification here
      } finally {
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    }
  }

  async function decrementQuantity(itemId: string | number) {
    const item = cart.cartItems.find(item => item.id === itemId);
    if (item && !loadingItems.has(itemId)) {
      setLoadingItems(prev => new Set(prev).add(itemId));
      try {
        const newQuantity = item.quantity - 1;
        if (newQuantity <= 0) {
          // If quantity becomes 0 or negative, remove the item
          await cart.removeFromCart(itemId);
          setSelectedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        } else {
          await cart.updateQuantity(itemId, newQuantity);
        }
      } catch (error) {
        console.error('Error decrementing quantity:', error);
        // You could add a toast notification here
      } finally {
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    }
  }

  async function removeItem(itemId: string | number) {
    try {
      await cart.removeFromCart(itemId);
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  const someSelected = cartItems.some((item) => item.selected);
  

  return (
    <div className="min-h-screen flex flex-col font-sans" >
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 flex-1">
        <CartTabs />
        
        {/* Back to Products Navigation */}
        <Link href="/product-catalog-sale" className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-(--color-primary) hover:text-(--color-olive) transition-colors">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-(--color-primary) rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-medium">Back to Products</span>
        </Link>


        <div className="mt-6 font-sans rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] font-sans items-center gap-4 px-4 sm:px-6 py-4 text-sm font-semibold text-[#273815]">
            <div className="font-sans flex justify-center">Select</div>
            <div className="font-sans">Product</div>
            <div className="font-sans text-center">Quantity</div>
            <div className="font-sans text-right">Price</div>
            <div className="font-sans text-center">Action</div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <Link href="/product-catalog-sale" className="inline-flex items-center px-6 py-3 bg-[#636B2F] text-white rounded-full hover:bg-[#4A5A2A] transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4 mt-4">
            {cartItems.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl font-sans bg-white shadow-sm ring-1 ring-black/[0.06] px-4 sm:px-6 py-4"
            >
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4">
                <div className="flex justify-center">
                  <input
                    aria-label="Select item"
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelection(item.id)}
                    className="size-4 accent-green-800"
                  />
                </div>

                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-14 rounded-lg bg-neutral-100 ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center text-xs text-neutral-500 shrink-0" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
                    {item.thumbnailSrc ? (
                      <Image
                        src={item.thumbnailSrc}
                        alt=""
                        width={56}
                        height={56}
                        className="object-cover size-full"
                      />
                    ) : (
                      <span style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Image</span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="truncate text-neutral-800" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
                      {item.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center font-sans justify-center gap-3">
                  <IconButton
                    label="Decrease quantity"
                    onClick={() => decrementQuantity(item.id)}
                    className={`text-[#273815] hover:bg-[#273815]/10 disabled:opacity-50 disabled:cursor-not-allowed ${loadingItems.has(item.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loadingItems.has(item.id) ? (
                      <div className="w-4 h-4 border-2 border-[#273815] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <MinusIcon />
                    )}
                  </IconButton>
                  <span className="w-6 text-center font-sans select-none font-medium">{item.quantity}</span>
                  <IconButton
                    label="Increase quantity"
                    onClick={() => incrementQuantity(item.id)}
                    className={`text-[#273815] font-sans hover:bg-[#273815]/10 ${loadingItems.has(item.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loadingItems.has(item.id) ? (
                      <div className="w-4 h-4 border-2 border-[#273815] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <PlusIcon />
                    )}
                  </IconButton>
                </div>

                <div className="text-right tabular-nums font-sans text-neutral-800">
                  {currency.format(item.unitPrice)}
                </div>

                <div className="flex justify-center">
                  <IconButton 
                    label="Remove item" 
                    onClick={() => removeItem(item.id)}
                    className="text-green-800 font-sans hover:bg-[#273815]/10"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-col-reverse font-sans gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06] font-sans p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium font-sans text-neutral-700">Subtotal:</p>
                  <p className="text-lg font-semibold font-sans text-neutral-800 tabular-nums">
                    {currency.format(cartTotal)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium font-sans text-neutral-700">Shipping:</p>
                  <p className="text-lg font-semibold font-sans text-neutral-800 tabular-nums">
                    {currency.format(shippingFee)}
                  </p>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold font-sans text-neutral-900">Total:</p>
                    <p className="text-xl font-bold font-sans text-[#636B2F] tabular-nums">
                      {currency.format(cartTotal + shippingFee)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={!someSelected}
              title={!someSelected ? 'Select at least one product to continue' : undefined}
              className={`inline-flex font-sans items-center justify-center gap-2 rounded-full px-8 h-12 shrink-0 transition-all duration-200 ${someSelected ? 'bg-[#636B2F] text-white hover:bg-[#4A5A2A] shadow-lg hover:shadow-xl' : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'}`}
              aria-label="Buy now"
            >
              <span className="font-sans font-medium">Buy Now</span>
            </button>
          </div>
        </div>

        {!someSelected && (
          <p className="mt-2 text-sm text-neutral-500">Select at least one product to proceed to checkout.</p>
        )}

        {isCheckoutOpen && (
          <CheckoutModal
            items={selectedItemsList}
            subtotal={cartTotal}
            shippingFee={shippingFee}
            onClose={() => setIsCheckoutOpen(false)}
          />
        )}
      </main>
    {/* footer */}
    <Footer />

    </div>
  );
}

function SiteHeader() {
  const cart = useCartContext();
  
  return (
    <header className="w-full font-sans">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Rf-logo.svg" alt="Refurnish" width={28} height={28} />
        </Link>

        <div className="ml-2 font-sans hidden sm:flex items-center flex-1">
          <div className="w-full max-w-md relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="w-full h-9 rounded-full font-sans bg-neutral-100 ring-1 ring-black/[0.06] pl-10 pr-4 text-sm focus:outline-none focus:ring-green-800/40"
              
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button className="size-9 rounded-full hover:bg-neutral-100 flex items-center justify-center relative">
            <Image src="/icon/cartIcon.png" alt="Cart" width={16} height={16} className="h-4 w-auto" />
            {cart.cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cart.cartCount}
              </span>
            )}
          </button>
          <button aria-label="Menu" className="size-9 rounded-full hover:bg-neutral-100 flex items-center justify-center">
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

function CartTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: "/cart-details/cart", label: "CART" },
    { href: "/cart-details/wishlist", label: "WISHLIST" },
    { href: "/cart-details/swap", label: "SWAP" },
    { href: "/cart-details/track-orders", label: "TRACK ORDERS" },
  ];

  return (
    <nav className=" font-sans mt-6" >
      <ul className="flex items-center justify-center gap-10 text-sm font-semibold">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          return (
            <li
              key={tab.href}
              className="flex font-sans flex-col items-center gap-1 text-neutral-700 hover:text-neutral-900 transition-colors"
              
            >
              <Link
                href={tab.href}
                className={`px-2 font-sans py-1 ${isActive ? 'font-semibold' : 'font-normal'}`}
                aria-current={isActive ? "page" : undefined}
              
              >
                {tab.label}
              </Link>
              <span className={`h-1 font-sans w-6 rounded-full ${isActive ? 'bg-[#273815]' : 'bg-transparent'}`} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


function CheckoutModal({
  items,
  subtotal,
  shippingFee,
  onClose,
}: {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  onClose: () => void;
}) {
  const total = subtotal + shippingFee;
  const { placeOrder } = useTrackOrders();
  const { user } = useAuth();
  const { refreshCartAfterCheckout } = useCartContext();
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentModalProps, setPaymentModalProps] = useState<{ provider: string; txnId?: string }>({ provider: "gcash" });

  const [selection, setSelection] = useState({
    paymentMode: "Cash on Delivery",
    ewalletOption: "gcash",
    cardType: "debit",
    deliveryMode: "LBC Express",
  });

  const [notice, setNotice] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
  const [cardValid, setCardValid] = useState(false);
  const [attemptedCardSubmit, setAttemptedCardSubmit] = useState(false);

  const handleSelectionChange = useCallback((s: any) => {
    setSelection(s);
  }, []);

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please log in to place an order');
      return;
    }

    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    // If user selected an e-wallet, open the payment mockup modal
    if (selection.paymentMode === "Ewallet") {
      const provider = selection.ewalletOption || "gcash";
      const txnId = `txn_${Date.now().toString(36).slice(-8)}`;
      setPaymentModalProps({ provider, txnId });
      setPaymentModalOpen(true);
      return;
    }

    // Cash on Delivery: treat as immediate order placement success
    if (selection.paymentMode === "Cash on Delivery") {
      const txnId = `cod_${Date.now().toString(36).slice(-8)}`;
      handlePaymentSuccess({ status: "SOLD", txnId, amount: total });
      return;
    }

    // Debit/Credit: require valid card inputs before proceeding
    if (selection.paymentMode === "Debit/Credit") {
      setAttemptedCardSubmit(true);
      if (!cardValid) {
        return;
      }
      const txnId = `card_${Date.now().toString(36).slice(-8)}`;
      handlePaymentSuccess({ status: "SOLD", txnId, amount: total });
      return;
    }
  };

  const handlePaymentSuccess = async (payload: { status: "SOLD"; txnId: string; amount: number }) => {
    console.log("Payment success", payload);
    setPaymentModalOpen(false);
    
    setIsPlacingOrder(true);
    try {
      const selectedItems = items.map(item => item.id.toString());
      await placeOrder({
        selectedItems,
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim() || undefined,
      }, {
        onSuccess: () => {
          // Refresh cart to remove only the ordered items (backend handles selective removal)
          refreshCartAfterCheckout();
        }
      });
      
      setNotice({ type: "success", message: "Your order has been placed successfully." });
    } catch (error) {
      console.error('Error placing order:', error);
      setNotice({ type: "error", message: "Failed to place order. Please try again." });
    } finally {
      setIsPlacingOrder(false);
    }
  };
  return (
    <div className="fixed inset-0 font-sans z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-5xl rounded-3xl bg-white p-6 sm:p-8 shadow-xl" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold text-neutral-800 mb-6">Check Out Form</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="text-neutral-700">
                <p className="font-semibold mb-2">Your Details :</p>
                <p>Name : {user?.firstName} {user?.lastName}</p>
                <p>Email : {user?.email}</p>
              </div>
              <div className="text-neutral-700">
                <p className="font-semibold mb-2">Shipping Address :</p>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete shipping address..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-neutral-700 font-semibold mb-2">
                Additional Notes (Optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order..."
                className="w-full h-16 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <p className="mt-8 font-semibold text-neutral-800">Your Order(s) :</p>
            <ul className="mt-3 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white ring-1 ring-black/[0.06] shadow-sm p-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-16 rounded-lg bg-neutral-100 ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center text-xs text-neutral-500 shrink-0">
                      {item.thumbnailSrc ? (
                        <Image src={item.thumbnailSrc} alt="" width={64} height={64} className="object-cover size-full" />
                      ) : (
                        <span>Image</span>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="truncate text-neutral-800">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="w-6 text-center">{item.quantity}</span>
                    <span className="tabular-nums">{currency.format(item.unitPrice)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <PaymentDeliverySelector 
                onChange={handleSelectionChange} 
                attemptedSubmit={attemptedCardSubmit} 
                onValidityChange={setCardValid} 
              />

              <div>
                <p className="text-neutral-700 font-medium">Refurnish Voucher :</p>
                <input 
                  placeholder="Voucher Code" 
                  className="mt-2 h-11 rounded-xl ring-1 ring-black/[0.08] flex items-center px-4 text-neutral-500 w-full"
                />
              </div>
            </div>

            <div className="space-y-2 text-neutral-700">
              <div className="flex items-center justify-between"><span>Item Subtotal :</span><span className="tabular-nums">{currency.format(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>Shipping fee :</span><span className="tabular-nums">{currency.format(shippingFee)}</span></div>
              <div className="flex items-center justify-between text-xl font-semibold text-[#636B2F]"><span>Total Payment :</span><span className="tabular-nums">{currency.format(total)}</span></div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={onClose} 
                disabled={isPlacingOrder}
                className="h-12 px-6 rounded-full ring-1 ring-black/[0.08] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !shippingAddress.trim()}
                className="h-12 px-6 rounded-full bg-[#636B2F] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>

            <PaymentMockupModal
              open={paymentModalOpen}
              onClose={() => setPaymentModalOpen(false)}
              amount={total}
              provider={paymentModalProps.provider}
              txnId={paymentModalProps.txnId}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>

        {notice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setNotice(null)} />
            <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                {notice.type === 'error' ? 'Something went wrong' : notice.type === 'success' ? 'Successful checkout!' : 'Notice'}
              </h3>
              <p className="text-sm text-neutral-700">{notice.message}</p>
              <div className="mt-4 flex justify-end gap-2">
                <button 
                  onClick={() => { 
                    setNotice(null); 
                    if (notice.type === 'success') {
                      onClose();
                      router.push('/cart-details/track-orders');
                    }
                  }} 
                  className="h-10 px-4 rounded-full bg-neutral-900 text-white"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 size-9 rounded-full hover:bg-neutral-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

// Reserved for future SelectAllCheckbox enhancement

function IconButton({
  children,
  onClick,
  label,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`size-8 rounded-full ring-1 ring-black/[0.06] bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 ${className}`}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 text-[#273815]">
      <path d="M10 4v12M4 10h12" stroke="#273815" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 text-[#273815]">
      <path d="M4 10h12" stroke="#273815" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
      <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" fill="currentColor" />
    </svg>
  );
}

function PaymentDeliverySelector({ onChange, attemptedSubmit = false, onValidityChange }: { onChange?: (s: any) => void; attemptedSubmit?: boolean; onValidityChange?: (valid: boolean) => void }) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  const [paymentMode, setPaymentMode] = useState("Cash on Delivery");
  const [ewalletOption, setEwalletOption] = useState("gcash");
  const [cardType, setCardType] = useState("debit");

  const [deliveryMode, setDeliveryMode] = useState("LBC Express");

  // Card inputs and errors
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState(""); // MM/YY
  const [cardCvc, setCardCvc] = useState("");
  const [cardErrors, setCardErrors] = useState<{ name?: string; number?: string; expiry?: string; cvc?: string }>({});

  const paymentRef = useRef<HTMLDivElement | null>(null);
  const deliveryRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep the ref updated with the latest onChange function
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (paymentRef.current && !paymentRef.current.contains(e.target as Node)) {
        setPaymentOpen(false);
      }
      if (deliveryRef.current && !deliveryRef.current.contains(e.target as Node)) {
        setDeliveryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // notify parent if needed
  useEffect(() => {
    if (typeof onChangeRef.current === "function") {
      onChangeRef.current({ paymentMode, ewalletOption, cardType, deliveryMode });
    }
  }, [paymentMode, ewalletOption, cardType, deliveryMode]);

  // Validation helpers
  function luhnCheck(num: string) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  function validateCard(): { valid: boolean; errors: typeof cardErrors } {
    if (paymentMode !== "Debit/Credit") return { valid: true, errors: {} };
    const errors: typeof cardErrors = {};
    const digits = cardNumber.replace(/\D/g, "");

    if (!cardName.trim()) {
      errors.name = "Cardholder name is required.";
    }

    if (digits.length < 13 || digits.length > 19 || !luhnCheck(digits)) {
      errors.number = "Enter a valid card number.";
    }

    // expiry MM/YY and not past
    const match = cardExpiry.match(/^\s*(\d{2})\/(\d{2})\s*$/);
    if (!match) {
      errors.expiry = "Enter expiry as MM/YY.";
    } else {
      const mm = parseInt(match[1], 10);
      const yy = parseInt(match[2], 10);
      if (mm < 1 || mm > 12) {
        errors.expiry = "Invalid expiry month.";
      } else {
        const now = new Date();
        const curYY = now.getFullYear() % 100;
        const curMM = now.getMonth() + 1;
        if (yy < curYY || (yy === curYY && mm < curMM)) {
          errors.expiry = "Card is expired.";
        }
      }
    }

    if (!/^\d{3,4}$/.test(cardCvc)) {
      errors.cvc = "CVC must be 3–4 digits.";
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  // Recompute validity on relevant changes and report to parent
  useEffect(() => {
    const { valid, errors } = validateCard();
    setCardErrors(errors);
    if (typeof onValidityChange === "function") onValidityChange(valid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMode, cardName, cardNumber, cardExpiry, cardCvc]);

  const paymentOptions = ["Cash on Delivery", "Ewallet", "Debit/Credit"];
  const ewalletOptions = [
    { id: "gcash", label: "", logo: "/icon/GCash_logo.png" },
    { id: "paymaya", label: "", logo: "/icon/maya.jpg" },
  ];
  const deliveryOptions = [
    "LBC Express",
    "J&T Express",
    "GGX",
    "Ninja Van",
    "Xend",
    "2GO",
    "GrabExpress",
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Mode of Payment */}
      <div>
        <p className="text-neutral-700 font-medium">Mode of Payment :</p>

        <div ref={paymentRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={paymentOpen}
            onClick={() => setPaymentOpen((s) => !s)}
            className="mt-2 h-11 rounded-xl ring-1 ring-black/[0.08] flex items-center justify-between px-4 w-full bg-white"
          >
            <span className="text-left truncate">{paymentMode}</span>
            <span className="ml-3 text-neutral-400">›</span>
          </button>

          {paymentOpen && (
            <ul
              role="listbox"
              tabIndex={-1}
              className="absolute z-10 mt-2 w-full rounded-lg bg-white ring-1 ring-black/[0.06] shadow-lg divide-y divide-neutral-100 max-h-56 overflow-auto"
            >
              {paymentOptions.map((opt) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={paymentMode === opt}
                  onClick={() => {
                    setPaymentMode(opt);
                    setPaymentOpen(false);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-neutral-50"
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3">
          {paymentMode === "Ewallet" && (
            <div className="rounded-xl ring-1 ring-black/[0.06] p-3 bg-white">
              <p className="text-sm font-medium text-neutral-700 mb-2">Choose e-wallet:</p>
              <div className="flex gap-4 items-center flex-wrap">
                {ewalletOptions.map((w) => (
                  <label key={w.id} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="ewallet"
                      value={w.id}
                      checked={ewalletOption === w.id}
                      onChange={() => setEwalletOption(w.id)}
                      className="cursor-pointer"
                    />

                    <Image
                      src={w.logo}
                      alt={w.label}
                      width={20}
                      height={20}
                      className="h-5 w-auto object-contain"
                    />

                    <span className="text-sm">{w.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 text-sm text-neutral-600">
                {ewalletOption === "gcash" && <p>You'll be redirected to GCash to complete the payment.</p>}
                {ewalletOption === "paymaya" && <p>You'll be redirected to PayMaya to complete the payment.</p>}
              </div>
            </div>
          )}

          {paymentMode === "Debit/Credit" && (
            <div className="rounded-xl ring-1 ring-black/[0.06] p-3 bg-white">
              {attemptedSubmit && Object.keys(cardErrors).length > 0 && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm" role="alert" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
                  Please correct the highlighted card details.
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-neutral-700">Card type:</p>
                <div className="flex items-center gap-2">
                  <Image src="/icon/visa.png" alt="Visa" width={20} height={20} className="h-5" />
                  <Image src="/icon/card.png" alt="Mastercard" width={20} height={20} className="h-5" />
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="cardType"
                    value="debit"
                    checked={cardType === "debit"}
                    onChange={() => setCardType("debit")}
                  />
                  <span className="text-sm">Debit</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="cardType"
                    value="credit"
                    checked={cardType === "credit"}
                    onChange={() => setCardType("credit")}
                  />
                  <span className="text-sm">Credit</span>
                </label>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <div>
                  <input
                    placeholder="Cardholder name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${attemptedSubmit && cardErrors.name ? 'border-red-300' : 'border-neutral-200'}`}
                  />
                  {attemptedSubmit && cardErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{cardErrors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    placeholder="Card number"
                    inputMode="numeric"
                    maxLength={23}
                    value={cardNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 19);
                      // group in 4s
                      const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(grouped);
                    }}
                    className={`w-full rounded-md border px-3 py-2 text-sm tabular-nums ${attemptedSubmit && cardErrors.number ? 'border-red-300' : 'border-neutral-200'}`}
                  />
                  {attemptedSubmit && cardErrors.number && (
                    <p className="mt-1 text-xs text-red-600">{cardErrors.number}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <input
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                        if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
                        else if (v.length >= 1 && parseInt(v[0],10) > 1) v = '0' + v[0] + (v[1] ? '/' + v.slice(1) : '');
                        setCardExpiry(v);
                      }}
                      className={`w-full rounded-md border px-3 py-2 text-sm ${attemptedSubmit && cardErrors.expiry ? 'border-red-300' : 'border-neutral-200'}`}
                    />
                    {attemptedSubmit && cardErrors.expiry && (
                      <p className="mt-1 text-xs text-red-600">{cardErrors.expiry}</p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <input
                      placeholder="CVC"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0,4))}
                      className={`w-full rounded-md border px-3 py-2 text-sm tabular-nums ${attemptedSubmit && cardErrors.cvc ? 'border-red-300' : 'border-neutral-200'}`}
                    />
                    {attemptedSubmit && cardErrors.cvc && (
                      <p className="mt-1 text-xs text-red-600">{cardErrors.cvc}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMode === "Cash on Delivery" && (
            <div className="mt-2 text-sm text-neutral-600">Pay with cash when your order is delivered.</div>
          )}
        </div>

      </div>

      {/* Mode of Delivery */}
      <div>
        <p className="text-neutral-700 font-medium">Mode of Delivery :</p>

        <div ref={deliveryRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={deliveryOpen}
            onClick={() => setDeliveryOpen((s) => !s)}
            className="mt-2 h-11 rounded-xl ring-1 ring-black/[0.08] flex items-center justify-between px-4 w-full bg-white"
          >
            <span className="text-left truncate">{deliveryMode}</span>
            <span className="ml-3 text-neutral-400">›</span>
          </button>

          {deliveryOpen && (
            <ul
              role="listbox"
              tabIndex={-1}
              className="absolute z-10 mt-2 w-full rounded-lg bg-white ring-1 ring-black/[0.06] shadow-lg divide-y divide-neutral-100 max-h-56 overflow-auto"
            >
              {deliveryOptions.map((opt) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={deliveryMode === opt}
                  onClick={() => {
                    setDeliveryMode(opt);
                    setDeliveryOpen(false);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-neutral-50"
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}



