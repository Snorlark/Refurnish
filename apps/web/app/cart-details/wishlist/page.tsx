"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from '../../../components/Footer';
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useWishlistContext } from '../../../contexts/WishlistContext';

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export default function WishlistPage() {
  const wishlist = useWishlistContext();
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

  const cartTotal = useMemo(() => {
    return wishlist.wishlistItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.priceNum, 0);
  }, [wishlist.wishlistItems, selectedItems]);

  const selectedWishlistItems = useMemo(() => 
    wishlist.wishlistItems.filter((i) => selectedItems.has(i.id)), 
    [wishlist.wishlistItems, selectedItems]
  );
  const someSelected = selectedItems.size > 0;
  const shippingFee = selectedItems.size > 0 ? 150 : 0;
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

  function removeItem(itemId: string | number) {
    wishlist.removeFromWishlist(itemId);
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }

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

        <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 font-sans ring-black/[0.06]">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-4 sm:px-6 py-4 text-sm font-semibold text-[#273815] font-sans">
            <div className="font-sans flex justify-center">Select</div>
            <div className="font-sans">Product</div>
            <div className="font-sans text-center">Quantity</div>
            <div className="font-sans text-right">Price</div>
            <div className="font-sans text-center">Action</div>
          </div>
        </div>

        {wishlist.wishlistItems.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            {!wishlist.isBackendAvailable && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-orange-600">Offline Mode</span>
              </div>
            )}
            <Link href="/product-catalog-sale" className="inline-flex items-center px-6 py-3 bg-[#636B2F] text-white rounded-full hover:bg-[#4A5A2A] transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4 mt-4">
            {wishlist.wishlistItems.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl font-sans bg-white shadow-sm ring-1 ring-black/[0.06] px-4 sm:px-6 py-4"
              
            >
              <div className="grid font-sans grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4">
                <div className="flex justify-center">
                  <input
                    aria-label="Select item"
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="size-4 font-sans accent-green-800"
                  />
                </div>

                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-14 font-sans rounded-lg bg-neutral-100 ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center text-xs text-neutral-500 shrink-0" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={56}
                        height={56}
                        className="object-cover size-full"
                      />
                    ) : (
                      <span className="font-sans">Image</span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="truncate text-neutral-800 font-sans">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.location}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm text-gray-500">Wishlist Item</span>
                </div>

                <div className="text-right tabular-nums font-sans text-neutral-800">
                  {currency.format(item.priceNum)}
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

        <div className="mt-10 flex justify-end">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={!someSelected}
            title={!someSelected ? 'Select at least one product to continue' : undefined}
            className={`inline-flex font-sans items-center justify-center gap-2 rounded-full px-8 h-12 shrink-0 transition-all duration-200 ${someSelected ? 'bg-[#636B2F] text-white hover:bg-[#4A5A2A] shadow-lg hover:shadow-xl' : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'}`}
            aria-label="Add to cart"
          >
            <span className="font-sans font-medium">Add to Cart</span>
          </button>
        </div>


        {isCheckoutOpen && (
          <CheckoutModal
            items={selectedWishlistItems}
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
  return (
    <header className="w-full font-sans " >
      <div className="mx-auto font-sans w-full max-w-6xl px-4 sm:px-6 md:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Rf-logo.svg" alt="Refurnish" width={28} height={28} />
        </Link>

        <div className="ml-2 hidden sm:flex items-center flex-1">
          <div className="w-full max-w-md relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="w-full font-sans  h-9 rounded-full bg-neutral-100 ring-1 ring-black/[0.06] pl-10 pr-4 text-sm focus:outline-none focus:ring-green-800/40"
              
            />
          </div>
        </div>

        <div className="ml-auto">
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
    <nav className="mt-6 font-sans ">
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
                className={`px-2 font-sans  py-1 ${isActive ? 'font-semibold' : 'font-normal'}`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
              <span className={`h-1 w-6 rounded-full ${isActive ? 'bg-[#273815]' : 'bg-transparent'}`} />
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
  items: any[];
  subtotal: number;
  shippingFee: number;
  onClose: () => void;
}) {
  const total = subtotal + shippingFee;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-5xl rounded-3xl bg-white p-6 sm:p-8 shadow-xl" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold text-neutral-800 mb-6">Check Out Form</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="text-neutral-700">
                <p className="font-semibold mb-2">Your Details :</p>
                <p>Name : Son Chaeyoung</p>
                <p>Contact No. : 099898333953</p>
                <p>Email : district8@gmail.com</p>
              </div>
              <div className="text-neutral-700">
                <p className="font-semibold mb-2">Address :</p>
                <p>Brgy. 29, Cavite City, Cavite, 4100</p>
                <p>2129 Block 23, Dunchondong St.</p>
              </div>
            </div>

            <p className="mt-8 font-semibold text-neutral-800">Your Order(s) :</p>
            <ul className="mt-3 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white ring-1 ring-black/[0.06] shadow-sm p-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-16 rounded-lg bg-neutral-100 ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center text-xs text-neutral-500 shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt="" width={64} height={64} className="object-cover size-full" />
                      ) : (
                        <span>Image</span>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="truncate text-neutral-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-sm text-gray-500">Wishlist</span>
                    <span className="tabular-nums">{currency.format(item.priceNum)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-neutral-700 font-medium">Mode of Payment :</p>
                <div className="mt-2 h-11 rounded-xl ring-1 ring-black/[0.08] flex items-center justify-between px-4">Cash on Delivery <span>›</span></div>
              </div>
              <div>
                <p className="text-neutral-700 font-medium">Mode of Delivery :</p>
                <div className="mt-2 h-11 rounded-xl ring-1 ring-black/[0.08] flex items-center justify-between px-4">LBC Express <span>›</span></div>
              </div>
              <div>
                <p className="text-neutral-700 font-medium">Voucher Applied :</p>
                <div className="mt-2 h-11 rounded-xl ring-1 ring-black/[0.08] flex items-center px-4 text-neutral-500">NONE</div>
              </div>
            </div>

            <div className="space-y-2 text-neutral-700">
              <div className="flex items-center justify-between"><span>Item Subtotal :</span><span className="tabular-nums">{currency.format(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>Shipping fee :</span><span className="tabular-nums">{currency.format(shippingFee)}</span></div>
              <div className="flex items-center justify-between text-xl font-semibold text-[#636B2F]"><span>Total Payment :</span><span className="tabular-nums">{currency.format(total)}</span></div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button onClick={onClose} className="h-12 px-6 rounded-full ring-1 ring-black/[0.08] bg-white">Cancel</button>
              <button className="h-12 px-6 rounded-full bg-[#636B2F] text-white">Place Order</button>
            </div>
          </div>
        </div>

        <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 size-9 rounded-full hover:bg-neutral-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}


