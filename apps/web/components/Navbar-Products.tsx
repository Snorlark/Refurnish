"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface NavbarProps {
  variant?: 'home' | 'shop' | 'catalog';
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  onAuthClick?: () => void;
  cartItemsCount?: number;
  wishlistItemsCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
}

export default function Navbar({
  variant = 'home',
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onAuthClick,
  cartItemsCount = 0,
  wishlistItemsCount = 0,
  onCartClick,
  onWishlistClick
}: NavbarProps) {
  const navbarRef = useRef<HTMLElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  type BackendProduct = {
    _id: string;
    title: string;
    images: string[];
    category?: string;
    status?: string;
    listedAs?: string;
  };
  type SuggestProduct = { id: string; title: string; category: string; listedAs: string };
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';
  const [allProducts, setAllProducts] = useState<SuggestProduct[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debug: Log user data to see profile picture
  useEffect(() => {
    if (user) {
      console.log('Navbar: User data:', user);
      console.log('Navbar: Profile picture URL:', user.profilePicture);
    }
  }, [user]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-menu')) {
          setIsProfileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

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
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Navbar suggestions fetch error:', e);
        }
      }
    };
    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!navbarRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "+=100",
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const height = gsap.utils.interpolate(64, 60, progress);
          const marginX = gsap.utils.interpolate(32, 18, progress);
          const marginY = gsap.utils.interpolate(0, 8, progress);
          const paddingX = gsap.utils.interpolate(22, 16, progress);
          const opacity = gsap.utils.interpolate(0, 1, progress);
          
          const radius = gsap.utils.interpolate(50, 50, progress);
          const shadowOpacity = gsap.utils.interpolate(0.08, 0.15, progress);

        

gsap.set(navbarRef.current, {
    borderRadius: `${radius}px`,
    boxShadow: `0 6px 20px rgba(0,0,0,${shadowOpacity})`,
    // background: `rgba(253,253,253,${0.85 + 0.1 * progress})`
  });
          gsap.set(navbarRef.current, {
            height: height,
            marginLeft: marginX,
            marginRight: marginX,
            marginTop: marginY,
            marginBottom: marginY,
          });
          
          const innerContainer = navbarRef.current?.querySelector('.nav-inner');
          if (innerContainer) {
            gsap.set(innerContainer, {
              paddingLeft: paddingX,
              paddingRight: paddingX,
            });
          }
          
          const logo = navbarRef.current?.querySelector('.nav-logo img');
          if (logo) {
            const logoScale = gsap.utils.interpolate(1, 0.85, progress);
            gsap.set(logo, { scale: logoScale });
          }
          
          const navLinks = Array.from(navbarRef.current?.querySelectorAll('.nav-links a') || []);
          navLinks.forEach((link) => {
            const textScale = gsap.utils.interpolate(1, 0.9, progress);
            gsap.set(link, { scale: textScale });
          });
          
          const icons = Array.from(navbarRef.current?.querySelectorAll('.nav-icons > *') || []);
          icons.forEach((icon) => {
            const iconScale = gsap.utils.interpolate(1, 0.9, progress);
            gsap.set(icon, { scale: iconScale });
          });
        }
      }
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const scrollToContact = () => {
    const contactElement = document.getElementById('contact');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderCenterContent = () => {
    if (variant === 'home') {
      return (
        <div className="nav-links hidden md:flex space-x-22 md:space-x-10 lg:space-x-18 xl:space-x-22 text-sm font-medium text-gray-700">
          <Link href="/landing" className="hover:text-(--color-olive) transition-modern text-(--color-primary)">Home</Link>
          <Link href="/shop" className="hover:text-(--color-olive) transition-modern">Shop</Link>
          <Link href="/about-us" className="hover:text-(--color-olive) transition-modern">About</Link>
          <button onClick={scrollToContact} className="hover:text-(--color-olive) cursor-pointer transition-modern">Contact</button>
        </div>
      );
    }

    return (
      <div className="nav-links hidden md:flex space-x-22 md:space-x-10 lg:space-x-18 xl:space-x-22 text-sm font-medium text-gray-700">
        <Link href="/landing" className="hover:text-(--color-olive) transition-modern">Home</Link>
        <Link href="/shop" className="hover:text-(--color-olive) transition-modern">Shop</Link>
        <Link href="/about-us" className="hover:text-(--color-olive) transition-modern">About</Link>
        <button onClick={scrollToContact} className="hover:text-(--color-olive) cursor-pointer transition-modern">Contact</button>
      </div>
    );
  };

  const renderMobileMenu = () => {
    const links = variant === 'home' ? [
      { href: '/landing', label: 'Home', active: true },
      { href: '/shop', label: 'Shop', active: false },
      { href: '/about-us', label: 'About', active: false },
      { href: '#contact', label: 'Contact', active: false, onClick: scrollToContact }
    ] : [
      { href: '/landing', label: 'Home', active: false },
      { href: '/shop', label: 'Shop', active: true },
      { href: '/about-us', label: 'About', active: false },
      { href: '#contact', label: 'Contact', active: false, onClick: scrollToContact }
    ];

    return (
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <img src="/icon/RF.png" alt="Logo" className="h-6 w-auto" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {links.map((link) => (
                link.onClick ? (
                  <button
                    key={link.label}
                    onClick={() => {
                      link.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left text-lg font-medium transition-colors ${
                      link.active ? 'text-(--color-primary)' : 'text-gray-700 hover:text-(--color-olive)'
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-lg font-medium transition-colors ${
                      link.active ? 'text-(--color-primary)' : 'text-gray-700 hover:text-(--color-olive)'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="mt-12 space-y-4">
              {isAuthenticated ? (
                <div className="p-4 bg-gray-50 rounded-full">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#636B2F] flex items-center justify-center text-white font-semibold mr-3">
                      {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href="/user-profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center px-3 py-2 text-sm bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center px-3 py-2 text-sm bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 text-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center w-full p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img src="/icon/userIcon.png" alt="Profile" className="h-5 w-5 mr-3" />
                  <span className="text-gray-700 font-medium">Profile</span>
                </Link>
              )}
              
              <button 
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
              >
                <img src="/icon/searchIcon.png" alt="Search" className="h-5 w-5 mr-3" />
                <span className="text-gray-700 font-medium">Search</span>
              </button>
              
              <button 
                onClick={() => {
                  onWishlistClick?.();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <img src="/icon/heartIcon.png" alt="Wishlist" className="h-5 w-5 mr-3" />
                <span className="text-gray-700 font-medium">Wishlist</span>
                {wishlistItemsCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistItemsCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => {
                  onCartClick?.();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <img src="/icon/cartIcon.png" alt="Cart" className="h-5 w-5 mr-3" />
                <span className="text-gray-700 font-medium">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else if ((searchQuery || '').trim()) {
      window.location.href = `/product-catalog-sale?search=${encodeURIComponent(searchQuery!)}`;
      setIsSearchOpen(false);
    }
  };

  const norm = (s: string) => (s || '').toLowerCase().trim();
  const q = norm(searchQuery || '');
  const categoryMatches = q
    ? allCategories.filter((c) => c.toLowerCase().includes(q)).slice(0, 5)
    : [];
  const titleMatches = q
    ? allProducts.filter((p) => norm(p.title).includes(q)).slice(0, 8)
    : [];

  return (
    <>
      <nav 
        ref={navbarRef}
        className="
          bg-[#fbfbfb]/72 
          backdrop-blur-md
          rounded-full
          border border-white/60 
          shadow-[0_4px_10px_rgba(0,0,0,0.07)] 
          mx-4 md:mx-10 fixed top-4 left-0 right-0 z-50 
          transition-all duration-300 ease-out
        "
        style={{ height: '64px' }}
      >
        <div className="nav-inner max-w-7xl mx-auto px-4 md:px-6 lg:px-9 h-full  justify-between items-center">
          
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <div className="nav-logo flex items-center">
              <Link href="/">
                <img src="/icon/RF.png" alt="Logo" className="h-6 w-auto object-cover" />
              </Link>
            </div>

            {/* Center Content - Desktop Only */}
            {renderCenterContent()}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Right Icons - Desktop Only */}
            <div className="nav-icons hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8 text-gray-700">
              <div 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer"
              >
                <img src="/icon/searchIcon.png" alt="Search" className="h-4 w-auto object-cover" />            
              </div>
              
              <button 
                onClick={onWishlistClick}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer relative"
              >
                <img src="/icon/heartIcon.png" alt="Wishlist" className="h-4 w-auto object-cover" />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center cursor-pointer justify-center font-bold">
                    {wishlistItemsCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={onCartClick}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer relative"
              >
                <img src="/icon/cartIcon.png" alt="Cart" className="h-4 w-auto object-cover" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <Link
                    href={`/user-profile/${user?.email?.replace('@gmail.com', '').replace('@', '') || ''}`}
                    className="w-10 h-10 rounded-full bg-[#636B2F] flex items-center justify-center hover:bg-[#4d5323] transition-modern cursor-pointer text-white font-semibold overflow-hidden"
                  >
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.currentTarget as HTMLImageElement;
                          const nextElement = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (nextElement) nextElement.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`${user?.profilePicture ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                      {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </Link>
                </div>
              ) : (
                <Link href="/login">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
                    <img src="/icon/userIcon.png" alt="Profile" className="h-4 w-auto object-cover" />            
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar - Toggle visibility when search icon is clicked */}
      {isSearchOpen && (
        <div className="fixed top-23 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md md:max-w-lg lg:max-w-xl px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-1">
            <form onSubmit={handleSearchSubmit} className="flex items-center relative">
              <div className="flex-1 flex items-center px-4 py-3">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by category or title"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange?.(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-black placeholder-gray-400 text-sm"
                  autoFocus
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const exactCat = allCategories.find((c) => c.toLowerCase() === q);
                      if (exactCat) {
                        setShowSuggestions(false);
                        router.push(`/product-catalog-sale?category=${encodeURIComponent(exactCat)}`);
                      } else {
                        setShowSuggestions(false);
                      }
                    }
                    if (e.key === 'Escape') setShowSuggestions(false);
                  }}
                />
              </div>
              <div className="flex items-center space-x-1 pr-1">
                <button 
                  type="submit"
                  className="p-2.5 bg-(--color-olive) cursor-pointer text-white rounded-xl hover:bg-(--color-primary) transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2.5 text-gray-400 cursor-pointer hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {showSuggestions && q && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <ul className="max-h-72 overflow-auto py-2 text-sm">
                    {categoryMatches.map((c) => (
                      <li key={`cat-${c}`}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowSuggestions(false);
                            router.push(`/product-catalog-sale?category=${encodeURIComponent(c)}`);
                            setIsSearchOpen(false);
                          }}
                        >
                          Category: {c}
                        </button>
                      </li>
                    ))}
                    {titleMatches.map((p) => (
                      <li key={`title-${p.id}`}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowSuggestions(false);
                            const toSale = (p.listedAs || 'sale').toLowerCase() !== 'swap';
                            router.push(toSale ? `/item-view-sale?id=${encodeURIComponent(p.id)}` : `/item-view-swap?id=${encodeURIComponent(p.id)}`);
                            setIsSearchOpen(false);
                          }}
                        >
                          {p.title}
                        </button>
                      </li>
                    ))}
                    {categoryMatches.length === 0 && titleMatches.length === 0 && (
                      <li className="px-4 py-2 text-gray-500">No results</li>
                    )}
                  </ul>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {renderMobileMenu()}
    </>
  );
}