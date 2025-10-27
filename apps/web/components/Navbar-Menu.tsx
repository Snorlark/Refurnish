"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface NavbarMenuProps {
  onWishlistClick?: () => void;
  onCartClick?: () => void;
}

export default function NavbarMenu({
  onWishlistClick,
  onCartClick
}: NavbarMenuProps) {
  const navbarRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { token } = useAuth();

  type BackendProduct = {
    _id: string;
    title: string;
    images: string[];
    category?: string;
    listedAs?: string;
  };

  type SuggestProduct = { id: string; title: string; category: string; listedAs: string };
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';
  const [allProducts, setAllProducts] = useState<SuggestProduct[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [lookupUsers, setLookupUsers] = useState<any[]>([]);

  const norm = (s: string) => (s || '').toLowerCase().trim();
  const q = norm(searchQuery);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [saleRes, bothRes, swapRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products?status=listed&listedAs=sale`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/products?status=listed&listedAs=both`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/products?status=listed&listedAs=swap`, { signal: controller.signal }),
        ]);
        if (!saleRes.ok || !bothRes.ok || !swapRes.ok) return;
        const sale: BackendProduct[] = await saleRes.json();
        const both: BackendProduct[] = await bothRes.json();
        const swap: BackendProduct[] = await swapRes.json();
        const merged = [...sale, ...both, ...swap];
        const mapped: SuggestProduct[] = merged.map((p) => ({
          id: p._id,
          title: p.title,
          category: (p.category || 'UNCATEGORIZED').toUpperCase(),
          listedAs: p.listedAs || 'sale',
        }));
        setAllProducts(mapped);
        setAllCategories(Array.from(new Set(mapped.map((m) => m.category))).filter(Boolean));
      } catch (e) {
        // silent
      }
    };
    load();
    return () => controller.abort();
  }, []);

  // Debounced shop account lookup by email (like ChatBubble)
  useEffect(() => {
    if (!token || !q) {
      setLookupUsers([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/users/lookup?email=${encodeURIComponent(searchQuery)}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setLookupUsers(Array.isArray(data) ? data : [data]);
        } else {
          setLookupUsers([]);
        }
      } catch {
        setLookupUsers([]);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [q, token]);

  const categoryMatches = q ? allCategories.filter((c) => c.toLowerCase().includes(q)).slice(0, 5) : [];
  const titleMatches = q ? allProducts.filter((p) => norm(p.title).includes(q)).slice(0, 8) : [];

  return (
    <nav
      ref={navbarRef}
      className="bg-white fixed top-0 left-0 right-0 z-50 h-16 shadow-sm"
    >
      <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/landing" className="nav-logo flex items-center flex-shrink-0">
            <img src="/icon/RF.png" alt="Logo" className="h-6 sm:h-7 w-auto object-cover" />
          </Link>

          {/* Search */}
          <div className="hidden sm:flex flex-1 mx-4">
            <div className="relative flex items-center gap-2 bg-gray-100 rounded-full px-4 h-9 w-full">
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M21 21l-3.5-3.5" strokeWidth="2" />
              </svg>
              <input
                className="bg-transparent outline-none text-gray-800 text-sm flex-1"
                placeholder="Search by category, title, or shop email"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const exactCat = allCategories.find((c) => c.toLowerCase() === q);
                    if (exactCat) {
                      setShowSuggestions(false);
                      router.push(`/product-catalog-sale?category=${encodeURIComponent(exactCat)}`);
                    } else if (searchQuery.trim()) {
                      setShowSuggestions(false);
                      router.push(`/product-catalog-sale?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
              />
              {showSuggestions && q && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <ul className="max-h-72 overflow-auto py-2 text-gray-800 text-sm">
                    {/* Accounts by email */}
                    {lookupUsers.length > 0 && (
                      <li className="px-4 py-1 text-xs text-gray-500">Accounts</li>
                    )}
                    {lookupUsers.map((u) => (
                      <li key={`user-${u.id || u._id || u.email}`}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowSuggestions(false);
                            const email = u.email;
                            if (email) router.push(`/user-profile/${email}`);
                          }}
                        >
                          <div className="font-medium">{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </button>
                      </li>
                    ))}
                    {/* Categories */}
                    {categoryMatches.length > 0 && (
                      <li className="px-4 py-1 text-xs text-gray-500">Categories</li>
                    )}
                    {categoryMatches.map((c) => (
                      <li key={`cat-${c}`}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowSuggestions(false);
                            router.push(`/product-catalog-sale?category=${encodeURIComponent(c)}`);
                          }}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                    {/* Titles */}
                    {titleMatches.length > 0 && (
                      <li className="px-4 py-1 text-xs text-gray-500">Products</li>
                    )}
                    {titleMatches.map((p) => (
                      <li key={`title-${p.id}`}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowSuggestions(false);
                            const toSale = (p.listedAs || 'sale').toLowerCase() !== 'swap';
                            router.push(toSale ? `/item-view-sale?id=${encodeURIComponent(p.id)}` : `/item-view-swap?id=${encodeURIComponent(p.id)}`);
                          }}
                        >
                          {p.title}
                        </button>
                      </li>
                    ))}
                    {lookupUsers.length === 0 && categoryMatches.length === 0 && titleMatches.length === 0 && (
                      <li className="px-4 py-2 text-gray-500">No results</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="nav-icons flex items-center space-x-4 text-gray-700">
            <Link href="/cart-details/wishlist">
              <button
                onClick={onWishlistClick}
                className="w-9 h-9 flex items-center justify-center hover:text-(--color-olive)"
              >
                <img src="/icon/heartIcon.png" alt="Wishlist" className="h-5 w-auto" />
              </button>
            </Link>

            <Link href="/cart-details/cart">
              <button
                onClick={onCartClick}
                className="w-9 h-9 flex items-center justify-center hover:text-(--color-olive)"
              >
                <img src="/icon/cartIcon.png" alt="Cart" className="h-5 w-auto" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
