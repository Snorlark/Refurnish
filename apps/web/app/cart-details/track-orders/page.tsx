//hehe
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from '../../../components/Footer';
import { useMemo, useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  status: string;
  thumbnailSrc?: string;
};

export default function TrackOrdersPage() {
  const [orders] = useState<OrderItem[]>([
    {
      id: "chair-360",
      name: "360° Swivel Wooden Office Chair",
      status: "Shipped out",
      
    },
    {
      id: "corner-cabinet",
      name: "Vintage Mahogany Corner Shelf/Cabinet",
      status: "Out for Delivery",
      
    },
    {
      id: "brown-sofa",
      name: "Brown Wood Sofa",
      status: "Preparing to Ship",
      
    },
    {
      id: "yamacata-painting",
      name: "YAMACATA Vintage Painting",
      status: "To Rate",
      
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col font-sans ">
      <SiteHeader />

      <main className="mx-auto w-full font-sans max-w-6xl px-4 sm:px-6 md:px-8 flex-1">
        <CartTabs />

        <div className="mt-6 rounded-2xl bg-white font-sans shadow-sm ring-1 ring-black/[0.06]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 py-3 text-sm font-semibold text-[#273815] font-sans">
            <div>Product</div>
            <div className=" font-sans text-right">Status</div>
          </div>
        </div>

        <ul className="space-y-4 mt-4">
          {orders.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl  font-sans bg-white shadow-sm ring-1 ring-black/[0.06] px-4 sm:px-6 py-4"
              
            >
              <div className="grid font-sans grid-cols-[1fr_auto] items-center gap-4">
                <div className="flex font-sans  items-center gap-4 min-w-0">
                  <div className="size-14 rounded-lg bg-neutral-100 ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center text-xs text-neutral-500 shrink-0 font-sans" >
                    {item.thumbnailSrc ? (
                      <Image
                        src={item.thumbnailSrc}
                        alt=""
                        width={56}
                        height={56}
                        className="object-cover size-full"
                      />
                    ) : (
                      <span className=" font-sans ">Image</span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className=" font-sans truncate text-neutral-800">
                      {item.name}
                    </p>
                  </div>
                </div>
                <div className=" font-sans text-right text-neutral-700">
                  {item.status}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>

    {/* footer */}
    <Footer />

    </div>
  );
}

function SiteHeader() {
  return (
    <header className="w-full" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Rf-logo.svg" alt="Refurnish" width={28} height={28} />
        </Link>

        <div className="ml-2 hidden sm:flex items-center flex-1">
          <div className="w-full max-w-md relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2  font-sans  text-neutral-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="w-full h-9 rounded-full  font-sans  bg-neutral-100 ring-1 ring-black/[0.06] pl-10 pr-4 text-sm focus:outline-none focus:ring-green-800/40"
             
            />
          </div>
        </div>

        <div className="ml-auto">
          <button aria-label="Menu" className="size-9  font-sans rounded-full hover:bg-neutral-100 flex items-center justify-center">
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
    { href: "/cart-details/track-orders", label: "TRACK ORDERS" },
  ];

  return (
    <nav className="mt-6 font-sans " >
      <ul className="flex  font-sans  items-center justify-center gap-10 text-sm font-semibold">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          return (
            <li
              key={tab.href}
              className="flex font-sans  flex-col items-center gap-1 text-neutral-700 hover:text-neutral-900 transition-colors"
              
            >
              <Link
                href={tab.href}
                className={` font-sans px-2 py-1 ${isActive ? 'font-semibold' : 'font-normal'}`}
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

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/[0.08] py-10" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-neutral-600">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image src="/Rf-long-black-logo.svg" alt="Refurnish" width={140} height={32} />
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <a href="#" className="hover:text-[#273815] transition-colors">
              <InstagramIcon />
            </a>
            <a href="#" className="hover:text-[#273815] transition-colors">
              <TikTokIcon />
            </a>
            <a href="#" className="hover:text-[#273815] transition-colors">
              <FacebookIcon />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-neutral-800" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Information</h3>
          <ul className="space-y-2">
            <li><a className="hover:text-neutral-800" href="#" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Privacy</a></li>
            <li><a className="hover:text-neutral-800" href="#" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Terms of Use</a></li>
            <li><a className="hover:text-neutral-800" href="#" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>About us</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-neutral-800" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Contact Us</h3>
          <ul className="space-y-1">
            <li style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Email: <a className="hover:text-neutral-800" href="mailto:support@refurnish.ph" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>support@refurnish.ph</a></li>
            <li style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Mobile / Viber: +63 912 345 6789</li>
            <li style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>Messenger: m.me/refurnishph</li>
            <li className="pt-2 text-xs text-neutral-500" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>© 2025 NOVU. All rights reserved.</li>
          </ul>
        </div>
      </div>
    </footer>
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


