"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSwap } from '../../../hooks/useSwap';
import { useAuth } from '../../../contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useCartContext } from '../../../contexts/CartContext';

export default function SwapCartPage() {
  const { swaps, isLoading, error, deleteSwapAsSeller } = useSwap();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 flex-1">
        <CartTabs />
        {/* <nav className="mt-6">
          <ul className="flex items-center justify-center gap-10 text-sm font-semibold">
            <li>
              <Link href="/cart-details/cart" className="px-2 py-1">CART</Link>
            </li>
            <li>
              <Link href="/cart-details/wishlist" className="px-2 py-1">WISHLIST</Link>
            </li>
            <li>
              <span className="px-2 py-1 font-semibold">SWAP</span>
              <span className="block h-1 w-6 rounded-full bg-[#273815] mx-auto" />
            </li>
            <li>
              <Link href="/cart-details/track-orders" className="px-2 py-1">TRACK ORDERS</Link>
            </li>
          </ul>
        </nav> */}

        {/* Back to Products Navigation */}
        <Link href="/product-catalog-swap" className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-(--color-primary) hover:text-(--color-olive) transition-colors">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-(--color-primary) rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-medium">Back to Products</span>
        </Link>

        <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 sm:px-6 py-4 text-sm font-semibold text-[#273815]">
            <div>Product</div>
            <div className="text-right">Status</div>
            <div className="text-right">Action</div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="mt-8 text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in to view your swaps</h3>
            <Link href="/login" className="inline-flex items-center px-6 py-3 bg-[#636B2F] text-white rounded-full hover:bg-[#4A5A2A] transition-colors">Login</Link>
          </div>
        ) : isLoading ? (
          <div className="mt-8 text-center py-12">Loading swaps...</div>
        ) : error ? (
          <div className="mt-8 text-center py-12 text-red-600">{error}</div>
        ) : swaps.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests yet</h3>
            <p className="text-gray-500 mb-6">Click the Swap button on a product to start a swap</p>
            <Link href="/product-catalog-swap" className="inline-flex items-center px-6 py-3 bg-[#636B2F] text-white rounded-full hover:bg-[#4A5A2A] transition-colors">Browse Swap Items</Link>
          </div>
        ) : (
          <ul className="space-y-4 mt-4">
            {swaps.map((swap) => (
              <li key={swap._id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06] px-4 sm:px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-lg bg-neutral-100 ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center text-xs text-neutral-500 shrink-0">
                    {swap.product?.image ? (
                      <Image src={swap.product.image} alt={swap.product.title} width={56} height={56} className="object-cover size-full" />
                    ) : (
                      <span>Image</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate">
                      {swap.product?.title || `Product ${swap.productId}`}
                    </p>
                    {swap.message && <p className="text-sm text-gray-500 truncate">Message: {swap.message}</p>}
                    <p className="text-xs text-gray-400">Requested at: {new Date(swap.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : swap.status === 'accepted' ? 'bg-green-100 text-green-800' : swap.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {swap.status}
                    </span>
                  </div>
                  {user?.role === 'seller' && (
                    <div className="ml-3">
                      <button
                        aria-label="Remove swap"
                        title="Remove"
                        onClick={async () => {
                          if (!confirm('Remove this swap request?')) return;
                          try {
                            await deleteSwapAsSeller(swap._id);
                          } catch (err) {
                            alert('Failed to remove swap');
                          }
                        }}
                        className="size-8 rounded-full ring-1 ring-black/[0.06] bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700"
                      >
                        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                          <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
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


