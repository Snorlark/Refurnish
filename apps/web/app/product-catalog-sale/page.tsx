"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Product = {
  id: number;
  title: string;
  image: string;
  location: string;
  price: number; // Added for sorting purposes
  dateAdded: string;
};

const productCatalog: Record<string, Product[]> = {
  CHAIRS: [
    {
      id: 1,
      title: "360° Swivel Wooden Office Chair",
      image: "/products/chair/view1.jpg",
      location: "Cavite",
      price: 500,
      dateAdded: "2025-08-25",
    },
    {
      id: 2,
      title: "Classic Rattan Chair",
      image: "/bedroom.png",
      location: "Cebu",
      price: 80,
      dateAdded: "2025-08-20",
    },
    {
      id: 9,
      title: "Ergonomic Office Chair",
      image: "/bedroom.png",
      location: "Makati",
      price: 250,
      dateAdded: "2025-08-15",
    },
    {
      id: 10,
      title: "Vintage Armchair",
      image: "/bedroom.png",
      location: "Tagaytay",
      price: 180,
      dateAdded: "2025-08-10",
    },
  ],
  TABLES: [
    {
      id: 3,
      title: "Dining Table",
      image: "/bedroom.png",
      location: "Makati",
      price: 300,
      dateAdded: "2025-08-22",
    },
    {
      id: 4,
      title: "Coffee Table",
      image: "/bedroom.png",
      location: "Tagaytay",
      price: 150,
      dateAdded: "2025-08-18",
    },
    {
      id: 11,
      title: "Study Desk",
      image: "/bedroom.png",
      location: "Cebu",
      price: 120,
      dateAdded: "2025-08-12",
    },
    {
      id: 12,
      title: "Console Table",
      image: "/bedroom.png",
      location: "Davao",
      price: 90,
      dateAdded: "2025-08-08",
    },
  ],
  SOFA: [
    {
      id: 5,
      title: "Modern Sofa",
      image: "/living.png",
      location: "Cebu",
      price: 450,
      dateAdded: "2025-08-21",
    },
    {
      id: 13,
      title: "Leather Loveseat",
      image: "/living.png",
      location: "Makati",
      price: 380,
      dateAdded: "2025-08-14",
    },
    {
      id: 14,
      title: "Sectional Sofa",
      image: "/living.png",
      location: "Amanpulo",
      price: 520,
      dateAdded: "2025-08-05",
    },
  ],
  CABINET: [
    {
      id: 6,
      title: "Classic Cabinet",
      image: "/living.png",
      location: "Davao",
      price: 200,
      dateAdded: "2025-08-19",
    },
    {
      id: 15,
      title: "Bookshelf",
      image: "/living.png",
      location: "Tagaytay",
      price: 160,
      dateAdded: "2025-08-11",
    },
    {
      id: 16,
      title: "Wardrobe",
      image: "/living.png",
      location: "Palawan",
      price: 280,
      dateAdded: "2025-08-07",
    },
  ],
  DECOR: [
    {
      id: 7,
      title: "Decorative Vase",
      image: "/living.png",
      location: "Palawan",
      price: 50,
      dateAdded: "2025-08-26",
    },
    {
      id: 17,
      title: "Wall Art",
      image: "/living.png",
      location: "Cebu",
      price: 75,
      dateAdded: "2025-08-13",
    },
    {
      id: 18,
      title: "Table Lamp",
      image: "/living.png",
      location: "Makati",
      price: 65,
      dateAdded: "2025-08-09",
    },
  ],
  MIRROR: [
    {
      id: 8,
      title: "Wall Mirror",
      image: "/dining.png",
      location: "Tagaytay",
      price: 180,
      dateAdded: "2025-08-23",
    },
    {
      id: 19,
      title: "Floor Mirror",
      image: "/dining.png",
      location: "Amanpulo",
      price: 220,
      dateAdded: "2025-08-16",
    },
    {
      id: 20,
      title: "Bathroom Mirror",
      image: "/dining.png",
      location: "Davao",
      price: 95,
      dateAdded: "2025-08-06",
    },
  ],
  LAMP: [],
  VANITY: [],

  SHELVES: [],
};

export default function ChairsCatalogPage() {
  const [menuOpen, setMenuOpen, ] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  const navbarRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categories = ["ALL", ...Object.keys(productCatalog)];
  const defaultCategory = "SALE";
  const [isSalePage, setIsSalePage] = useState(true); // since this is the Sale page
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    if (!navbarRef.current) return;
    const navEl = navbarRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "+=100",
          scrub: 0.5,
          onUpdate: (self) => {
            const progress = self.progress;
            // const height = gsap.utils.interpolate(72, 60, progress);
            // const marginX = gsap.utils.interpolate(12, 6, progress);
                      const height = gsap.utils.interpolate(64, 60, progress);
                      const marginX = gsap.utils.interpolate(32, 18, progress);
                      const marginY = gsap.utils.interpolate(0, 8, progress);
                      const paddingX = gsap.utils.interpolate(22, 16, progress);
            // use gsap.set to avoid layout thrash
            gsap.set(navEl, {
              height,
              marginLeft: marginX,
              marginRight: marginX,
            });

            const logo = navEl.querySelector(
              ".nav-logo img"
            ) as HTMLElement | null;
            if (logo)
              gsap.set(logo, {
                scale: gsap.utils.interpolate(1, 0.9, progress),
              });

            const icons = navEl.querySelectorAll(
              ".nav-icons button"
            ) as NodeListOf<HTMLElement>;
            icons.forEach((i) =>
              gsap.set(i, { scale: gsap.utils.interpolate(1, 0.9, progress) })
            );
          },
        },
      });
    }, navEl);

    return () => ctx.revert();
  }, []);

  // Animate product cards whenever activeCategory changes
  useEffect(() => {
    if (!gridRef.current) return;
    const scope = gridRef.current;
    const ctx = gsap.context(() => {
      // target only children inside the grid (context scoped)
      gsap.fromTo(
        ".product-card",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: scope,
            start: "top 85%",
            once: false,
          },
        }
      );
    }, scope);

    return () => ctx.revert();
  }, [activeCategory]);

  // Get unique locations from products
  const allLocations = Array.from(
    new Set(
      Object.values(productCatalog)
        .flat()
        .map((product) => product.location)
    )
  );

  // Enhanced filtering logic
  let filteredItems: Product[] =
    activeCategory === "ALL"
      ? Object.values(productCatalog).flat()
      : productCatalog[activeCategory] ?? [];

  // Apply location filter
  if (selectedLocations.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      selectedLocations.includes(item.location)
    );
  }

  // Apply price range filter
  filteredItems = filteredItems.filter(
    (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
  );

  // Apply sorting
  filteredItems = [...filteredItems].sort((a, b) => {
    if (sortOption === "lowToHigh") return a.price - b.price;
    if (sortOption === "highToLow") return b.price - a.price;
    if (sortOption === "newest")
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    if (sortOption === "oldest")
      return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
    if (sortOption === "nameAZ") return a.title.localeCompare(b.title);
    if (sortOption === "nameZA") return b.title.localeCompare(a.title);
    return 0;
  });

  // Use the enhanced filteredItems for display
  const filteredProducts: Product[] = filteredItems;

 const updateDropdownPos = () => {
    const btn = menuBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8; // 8px gap under button
    const right = Math.max(8, window.innerWidth - rect.right); // right offset in px
    setDropdownPos({ top, right });
  };

  useEffect(() => {
    if (!menuOpen) return;
    updateDropdownPos();
    const onResize = () => updateDropdownPos();
    const onScroll = () => updateDropdownPos();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);


  return (
    <>
      <main className="bg-[#fcfcfc] font-sans   min-h-screen transition-all ease-in-out duration-300 ">
        {/* NAVBAR */}
       

        <nav
          ref={navbarRef}
          className="bg-[#ffffff] backdrop-blur-md  border border-green/10
    shadow-[0_4px_10px_rgba(0,0,0,0.07)]  rounded-full  sm:mx-6 md:mx-8 my-2 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
          style={{ height: 64 }}
        >
          <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-9 h-full">
            <div className="flex justify-between items-center h-full gap-3">
              {/* Logo */}
              <Link
                href="/landing"
                className="nav-logo flex items-center flex-shrink-0"
              >
                <img
                  src="/icon/RF.png"
                  alt="Logo"
                  className="h-6 sm:h-7 w-auto object-cover"
                />
              </Link>

              {/* Search bar (hidden on xs, expands on sm+) */}
              <div className="hidden sm:flex flex-1 mx-3 sm:mx-6">
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 sm:px-5 h-9 w-full">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="7" strokeWidth="2" />
                    <path d="M21 21l-3.5-3.5" strokeWidth="2" />
                  </svg>
                  <input
                    className="bg-transparent outline-none text-sm flex-1"
                    placeholder="Search"
                  />
                </div>
              </div>

              {/* Icons */}
              <div className="nav-icons flex items-center space-x-3 sm:space-x-4 text-gray-700">
                <Link href="/cart-details/wishlist">
                  <button className="w-8 h-8 sm:w-9 cursor-pointer sm:h-9 flex items-center justify-center hover:text-(--color-olive)">
                    <img
                      src="/icon/heartIcon.png"
                      alt="Wishlist"
                      className="h-4 w-auto"
                    />
                  </button>
                </Link>
                <Link href="/cart-details/cart">
                  <button className="w-8 h-8 sm:w-10 cursor-pointer sm:h-10 flex items-center justify-center hover:text-(--color-olive)">
                    <img
                      src="/icon/cartIcon.png"
                      alt="Cart"
                      className="h-4 w-auto"
                    />
                  </button>
                </Link>

                <button                 
                  onClick={() => setMenuOpen(true)}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:text-(--color-olive)">
                  <img
                    src="/icon/menuIcon.png"
                    alt="Account"
                    className="h-4 w-auto"
                  />
                </button>
              </div>
            </div>
          </div>
        </nav>
        
  <AnimatePresence>
        {menuOpen && (
          <>
            {/* overlay: placed after the nav so it will blur/dim the page (including nav) */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm  "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* dropdown: fixed and positioned using computed top/right so it aligns with the menu button's right edge */}
            <motion.div
              role="menu"
              aria-label="User shortcuts"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              style={
                dropdownPos
                  ? { position: "fixed", top: dropdownPos.top, right: dropdownPos.right, zIndex: 60 }
                  : { position: "fixed", top: 80, right: 16, zIndex: 60 } // fallback
              }
              className="w-56 bg-[#ffffff] 2xl:mr-18 xl:mr-12 lg:mr-8 md:mr-6 mr-4 backdrop-blur-md rounded-2xl shadow-lg border mt-2 border-gray-200 overflow-hidden"
            >
              {/* small top-right back/close icon */}
              <div className="flex justify-end p-2 border-b border-gray-100">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded"
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              <Link
                href="/user-profile"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100/70"
                onClick={() => setMenuOpen(false)}
              >
                <img src="/icon/account.png" alt="" className="w-4 h-4" />
                Account
              </Link>

              <Link
                href="/messages-section"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100/70"
                onClick={() => setMenuOpen(false)}
              >
                <img src="/icon/chat.png" alt="" className="w-4 h-4" />
                Chat
              </Link>

              <Link
                href="/seller-dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100/70"
                onClick={() => setMenuOpen(false)}
              >
                <img src="/icon/dashboard.png" alt="" className="w-4 h-4" />
                Seller Dashboard
              </Link>

              <button
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                onClick={() => {
                  setMenuOpen(false);
                  // TODO: logout logic
                }}
              >
                <img src="/icon/logout.png" alt="" className="w-4 h-4" />
                Log Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>


        <div className="h-20" />

      {/* CATEGORY TABS (centered) */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-9">
          <div className=" mx-5 md:mx-20 text-center opacity-50"></div>

          {/* CATEGORY TABS (centered) */}
          <div className="mt-3 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm">
            {categories.map((c) => {
              const active = c === activeCategory;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`relative pb-1 sm:pb-2 transition-colors ${
                    active
                      ? "font-semibold text-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {c}
                  {active && (
                    <span className="absolute -bottom-[3px] left-0 right-0 mx-auto block h-[4px] w-3 sm:w-4 rounded-full bg-black" />
                  )}
                </button>
              );
            })}
          </div>

          {/* FILTER SECTION */}
          <div className="mt-6 mb-8 mx-22">
            {/* Filter Toggle Button and Sale/Swap Buttons */}
            <div className="flex justify-between items-center mb-4">
              {/* Sale & Swap Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setIsSalePage(true)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                    isSalePage
                      ? "bg-(--color-primary) text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Sale
                </button>

                <Link
                  href="/product-catalog-swap"
                  className="px-6 py-3 bg-white border-2 border-gray-200  rounded-full text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200"
                >
                  Swap
                </Link>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex font-sans items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-(--color-olive) hover:text-(--color-olive) transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters & Sort
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white  font-sans rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full px-4 py-3 font-sans  border border-gray-200 rounded-xl focus:ring-2 focus:ring-(--color-olive) focus:border-(--color-olive) outline-none transition-all duration-300 bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="lowToHigh">Price: Low to High</option>
                      <option value="highToLow">Price: High to Low</option>
                      <option value="nameAZ">Name: A to Z</option>
                      <option value="nameZA">Name: Z to A</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              parseInt(e.target.value) || 0,
                              priceRange[1],
                            ])
                          }
                          placeholder="Min"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-(--color-olive) focus:border-(--color-olive) outline-none text-sm"
                        />
                        <span className="text-gray-400 self-center">-</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              parseInt(e.target.value) || 600,
                            ])
                          }
                          placeholder="Max"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-(--color-olive) focus:border-(--color-olive) outline-none text-sm"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        ₱{priceRange[0]} - ₱{priceRange[1]}
                      </div>
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allLocations.map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            if (selectedLocations.includes(location)) {
                              setSelectedLocations(
                                selectedLocations.filter(
                                  (loc) => loc !== location
                                )
                              );
                            } else {
                              setSelectedLocations([
                                ...selectedLocations,
                                location,
                              ]);
                            }
                          }}
                          className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                            selectedLocations.includes(location)
                              ? "bg-(--color-olive) text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                      {selectedLocations.length > 0 && (
                        <button
                          onClick={() => setSelectedLocations([])}
                          className="px-3 py-2 rounded-full text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="lg:col-span-3  font-sans  flex justify-end">
                    <button
                      onClick={() => {
                        setPriceRange([0, 600]);
                        setSelectedLocations([]);
                        setSortOption("newest");
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedLocations.length > 0 ||
                  priceRange[0] > 0 ||
                  priceRange[1] < 600) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {selectedLocations.map((location) => (
                        <span
                          key={location}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                        >
                          {location}
                          <button
                            onClick={() =>
                              setSelectedLocations(
                                selectedLocations.filter(
                                  (loc) => loc !== location
                                )
                              )
                            }
                            className="ml-1 hover:text-green-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {(priceRange[0] > 0 || priceRange[1] < 600) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          Price: ₱{priceRange[0]} - ₱{priceRange[1]}
                          <button
                            onClick={() => setPriceRange([0, 600])}
                            className="ml-1 hover:text-purple-600"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="text-center text-sm text-gray-600 mb-4">
              Showing {filteredItems.length} of{" "}
              {Object.values(productCatalog).flat().length} products
            </div>
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section className="max-w-7xl mx-auto px-6 lg:px-9 mt-8">
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                No products in this category yet.
              </div>
            ) : (
              filteredProducts.map((item) => (
                <article
                  key={`${item.id}-${item.title}`}
                  className="product-card bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
                >
                  <div className="relative ">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={600}
                      height={420}
                      className="w-full h-44 object-cover"
                    />
                  </div>

                  <Link href="/item-view-sale">
                    <div className="p-4">
                      <h3 className="text-[15px] text-(--color-olive) font-semibold">
                        {item.title}
                      </h3>
                      <div className="mt-1 text-[14px] text-black">
                        ₱{item.price}.00
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[13px] text-gray-600">
                        <img
                          src="/icon/locateIcon.png"
                          alt="Location"
                          className="w-4 h-auto"
                        />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>

        </section>

        {/* FOOTER */}
        <div className="border-t-[0.2px] border-(--color-olive) mt-12 text-center"></div>

        <footer className="bg-(--color-white) text-(--color-primary) py-16 px-6 lg:px-16">
          <div className="max-w-7xl px-6 lg:px-9 py-4 container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* Logo and Social */}
              <div>
                <img
                  src="/refurnishlogoSection.png"
                  alt="Logo"
                  className=" w-60 pb-2 h-auto object-center"
                />
                <div className="flex space-x-3">
                  <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                    </svg>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Information */}
              <div>
                <h4 className="text-md font-semibold mb-4">Information</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-(--color-olive) transition-modern text-sm"
                    >
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-(--color-olive) transition-modern text-sm"
                    >
                      Terms of Use
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-(--color-olive) transition-modern text-sm"
                    >
                      About Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-md font-semibold mb-4">Contact Us</h4>
                <ul className="space-y-3 text-sm">
                  <li>Email: info@refurnish.com</li>
                  <li>Mobile/Viber: +63 912 345 6789</li>
                  <li>Messenger: @refurnish</li>
                </ul>
              </div>

              <div>
                <p className="text-bottom text-sm">
                  © 2023. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}