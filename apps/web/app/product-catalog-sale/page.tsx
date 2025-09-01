"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
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
    { id: 1, title: "360° Swivel Wooden Office Chair", image: "/products/chair/view1.jpg", location: "Cavite", price: 500, dateAdded: "2025-08-25" },
    { id: 2, title: "Classic Rattan Chair", image: "/bedroom.png", location: "Cebu", price: 80, dateAdded: "2025-08-20" },
    { id: 9, title: "Ergonomic Office Chair", image: "/bedroom.png", location: "Makati", price: 250, dateAdded: "2025-08-15" },
    { id: 10, title: "Vintage Armchair", image: "/bedroom.png", location: "Tagaytay", price: 180, dateAdded: "2025-08-10" },
  ],
  TABLES: [
    { id: 3, title: "Dining Table", image: "/bedroom.png", location: "Makati", price: 300, dateAdded: "2025-08-22" },
    { id: 4, title: "Coffee Table", image: "/bedroom.png", location: "Tagaytay", price: 150, dateAdded: "2025-08-18" },
    { id: 11, title: "Study Desk", image: "/bedroom.png", location: "Cebu", price: 120, dateAdded: "2025-08-12" },
    { id: 12, title: "Console Table", image: "/bedroom.png", location: "Davao", price: 90, dateAdded: "2025-08-08" },
  ],
  SOFA: [
    { id: 5, title: "Modern Sofa", image: "/living.png", location: "Cebu", price: 450, dateAdded: "2025-08-21" },
    { id: 13, title: "Leather Loveseat", image: "/living.png", location: "Makati", price: 380, dateAdded: "2025-08-14" },
    { id: 14, title: "Sectional Sofa", image: "/living.png", location: "Amanpulo", price: 520, dateAdded: "2025-08-05" },
  ],
  CABINET: [
    { id: 6, title: "Classic Cabinet", image: "/living.png", location: "Davao", price: 200, dateAdded: "2025-08-19" },
    { id: 15, title: "Bookshelf", image: "/living.png", location: "Tagaytay", price: 160, dateAdded: "2025-08-11" },
    { id: 16, title: "Wardrobe", image: "/living.png", location: "Palawan", price: 280, dateAdded: "2025-08-07" },
  ],
  DECOR: [
    { id: 7, title: "Decorative Vase", image: "/living.png", location: "Palawan", price: 50, dateAdded: "2025-08-26" },
    { id: 17, title: "Wall Art", image: "/living.png", location: "Cebu", price: 75, dateAdded: "2025-08-13" },
    { id: 18, title: "Table Lamp", image: "/living.png", location: "Makati", price: 65, dateAdded: "2025-08-09" },
  ],
  MIRROR: [
    { id: 8, title: "Wall Mirror", image: "/dining.png", location: "Tagaytay", price: 180, dateAdded: "2025-08-23" },
    { id: 19, title: "Floor Mirror", image: "/dining.png", location: "Amanpulo", price: 220, dateAdded: "2025-08-16" },
    { id: 20, title: "Bathroom Mirror", image: "/dining.png", location: "Davao", price: 95, dateAdded: "2025-08-06" },
  ],
  LAMP: [
    
  ],
  VANITY: [
    
  ],

  SHELVES: [
    
  ],
};



export default function ChairsCatalogPage() {
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
            const height = gsap.utils.interpolate(72, 60, progress);
            const marginX = gsap.utils.interpolate(12, 6, progress);
            // use gsap.set to avoid layout thrash
            gsap.set(navEl, {
              height,
              marginLeft: marginX,
              marginRight: marginX,
            });

            const logo = navEl.querySelector(".nav-logo img") as HTMLElement | null;
            if (logo) gsap.set(logo, { scale: gsap.utils.interpolate(1, 0.9, progress) });

            const icons = navEl.querySelectorAll(".nav-icons button") as NodeListOf<HTMLElement>;
            icons.forEach((i) =>
              gsap.set(i, { scale: gsap.utils.interpolate(1, 0.9, progress) })
            );
          },
        },
      });

      // keep a reference so cleanup kills this timeline too
      // (timeline is scoped inside ctx and will be reverted by ctx.revert())
      // nothing else needed here
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
  const allLocations = Array.from(new Set(Object.values(productCatalog).flat().map(product => product.location)));

  // Enhanced filtering logic
  let filteredItems: Product[] =
    activeCategory === "ALL"
      ? Object.values(productCatalog).flat()
      : productCatalog[activeCategory] ?? [];



  // Apply location filter
  if (selectedLocations.length > 0) {
    filteredItems = filteredItems.filter(item =>
      selectedLocations.includes(item.location)
    );
  }

  // Apply price range filter
  filteredItems = filteredItems.filter(item =>
    item.price >= priceRange[0] && item.price <= priceRange[1]
  );

  // Apply sorting
  filteredItems = [...filteredItems].sort((a, b) => {
    if (sortOption === "lowToHigh") return a.price - b.price;
    if (sortOption === "highToLow") return b.price - a.price;
    if (sortOption === "newest") return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    if (sortOption === "oldest") return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
    if (sortOption === "nameAZ") return a.title.localeCompare(b.title);
    if (sortOption === "nameZA") return b.title.localeCompare(a.title);
    return 0;
  });



  // Use the enhanced filteredItems for display
  const filteredProducts: Product[] = filteredItems;




  return (
    <>
    <main className="bg-white font-['Futura'] min-h-screen transition-all ease-in-out duration-300 ">
         {/* NAVBAR */}
          <nav
            ref={navbarRef}
            className="bg-white/95 backdrop-blur-md rounded-full mx-3 sm:mx-6 md:mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
            style={{ height: 72 }}
          >
            <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-9 h-full">
              <div className="flex justify-between items-center h-full gap-3">
                {/* Logo */}
                <Link href="/landing" className="nav-logo flex items-center flex-shrink-0">
                  <img src="/icon/RF.png" alt="Logo" className="h-6 sm:h-7 w-auto object-cover" />
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
                  <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:text-(--color-olive)">
                    <img src="/icon/heartIcon.png" alt="Wishlist" className="h-4 w-auto" />
                  </button>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-(--color-olive)">
                    <img src="/icon/cartIcon.png" alt="Cart" className="h-4 w-auto" />
                  </button>
                  <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:text-(--color-olive)">
                    <img src="/icon/menuIcon.png" alt="Account" className="h-4 w-auto" />
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Spacer for fixed nav */}
          <div className="h-20 sm:h-15" />

      {/* CATEGORY TABS (centered) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-9">

          <div className="border-t-[0.1px] border-(--color-primary) mx-5 md:mx-20 text-center opacity-50"></div>

          {/* CATEGORY TABS (centered) */}
          <div className="mt-3 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm">
            {categories.map((c) => {
            const active = c === activeCategory;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`relative pb-1 sm:pb-2 transition-colors ${
                  active ? "font-semibold text-black" : "text-gray-600 hover:text-gray-900"
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
                     isSalePage ? "bg-(--color-primary) text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                 className="flex font-['Futura'] items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-(--color-olive) hover:text-(--color-olive) transition-all duration-300 shadow-sm hover:shadow-md"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
                 Filters & Sort
                 <svg className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </button>
             </div>

             {/* Filter Panel */}
             {showFilters && (
               <div className="bg-white  font-['Futura'] rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 max-w-4xl mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full px-4 py-3 font-['Futura']  border border-gray-200 rounded-xl focus:ring-2 focus:ring-(--color-olive) focus:border-(--color-olive) outline-none transition-all duration-300 bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          placeholder="Min"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-(--color-olive) focus:border-(--color-olive) outline-none text-sm"
                        />
                        <span className="text-gray-400 self-center">-</span>
                                                 <input
                           type="number"
                           value={priceRange[1]}
                           onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 600])}
                           placeholder="Max"
                           className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-(--color-olive) focus:border-(--color-olive) outline-none text-sm"
                         />
                      </div>
                      <div className="text-xs text-gray-500">₱{priceRange[0]} - ₱{priceRange[1]}</div>
                    </div>
                  </div>

                  {/* Location Filter */}
                   <div className="lg:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                     <div className="flex flex-wrap gap-2">
                       {allLocations.map((location) => (
                         <button
                           key={location}
                           onClick={() => {
                             if (selectedLocations.includes(location)) {
                               setSelectedLocations(selectedLocations.filter(loc => loc !== location));
                             } else {
                               setSelectedLocations([...selectedLocations, location]);
                             }
                           }}
                           className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                             selectedLocations.includes(location)
                               ? 'bg-(--color-olive) text-white'
                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                   <div className="lg:col-span-3  font-['Futura']  flex justify-end">
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
                 {(selectedLocations.length > 0 || priceRange[0] > 0 || priceRange[1] < 600) && (
                   <div className="mt-4 pt-4 border-t border-gray-200">
                     <div className="flex flex-wrap gap-2">
                      {selectedLocations.map((location) => (
                        <span key={location} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {location}
                          <button onClick={() => setSelectedLocations(selectedLocations.filter(loc => loc !== location))} className="ml-1 hover:text-green-600">×</button>
                        </span>
                      ))}
                       {(priceRange[0] > 0 || priceRange[1] < 600) && (
                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                           Price: ₱{priceRange[0]} - ₱{priceRange[1]}
                           <button onClick={() => setPriceRange([0, 600])} className="ml-1 hover:text-purple-600">×</button>
                         </span>
                       )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="text-center text-sm text-gray-600 mb-4">
              Showing {filteredItems.length} of {Object.values(productCatalog).flat().length} products
            </div>
          </div>
        </section>


      {/* PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto md:mx-30 px-6 lg:px-9 mt-8">
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">
              No products in this category yet.
            </div>
          ) : (
            filteredProducts.map((item) => (
              <article key={`${item.id}-${item.title}`} className="product-card bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden">
                <div className="relative ">
                  <Image src={item.image} alt={item.title} width={600} height={420} className="w-full h-44 object-cover" />
                </div>

                <Link 
                href="/item-view-sale">
                <div className="p-4">
                  <h3 className="text-[15px] text-(--color-olive) font-semibold">{item.title}</h3>
                  <div className="mt-1 text-[14px]">₱{item.price}.00</div>
                  <div className="mt-2 flex items-center gap-2 text-[13px] text-gray-600">
                    <img src="/icon/locateIcon.png" alt="Location" className="w-4 h-auto" />
                    <span>{item.location}</span>
                  </div>
                </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </section>

      {/* FOOTER */}
      <div className="border-t-[0.2px] border-(--color-olive) mt-12  text-center"></div>

      <footer className="bg-(--color-white) text-(--color-primary) py-16 px-6 lg:px-16">
        <div className="max-w-7xl px-6 lg:px-9 py-4 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo and Social */}
            <div>
                <img src="/refurnishlogoSection.png" alt="Logo" className=" w-60 pb-2 h-auto object-center" />
              <div className="flex space-x-3">
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-md font-semibold mb-4">Information</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Privacy</a></li>
                <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Terms of Use</a></li>
                <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">About Us</a></li>
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
              <p className="text-bottom text-sm">© 2023. All rights reserved.</p>
            </div>
          </div>
          
        </div>
      </footer>

    </main>
    </>
  );
}



//"use client";

// import Image from "next/image";
// import Link from 'next/link';
// import { useEffect, useRef } from 'react';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// // Register ScrollTrigger plugin
// if (typeof window !== 'undefined') {
//   gsap.registerPlugin(ScrollTrigger);
// }

// export default function Home() {
//   const navbarRef = useRef<HTMLElement>(null);

//   useEffect(() => {
//     if (!navbarRef.current) return;

//     // Create the shrinking animation
//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: "main",
//         start: "top top",
//         end: "+=100",
//         scrub: 0.5,
//         onUpdate: (self) => {
//           // Update navbar styles based on scroll progress
//           const progress = self.progress;
          
//           // Shrink height
//           const height = gsap.utils.interpolate(80, 60, progress);
          
//           // Shrink horizontal margins
//           const marginX = gsap.utils.interpolate(32, 18, progress);
//           const marginY = gsap.utils.interpolate(0, 16, progress);
          
//           // Adjust padding
//           const paddingX = gsap.utils.interpolate(26, 16, progress);
        
          
//           // Apply styles
//           gsap.set(navbarRef.current, {
//             height: height,
//             marginLeft: marginX,
//             marginRight: marginX,
//             marginTop: marginY,
//             marginBottom: marginY,
//           });
          
//           // Update inner container padding
//           const innerContainer = navbarRef.current?.querySelector('.nav-inner');
//           if (innerContainer) {
//             gsap.set(innerContainer, {
//               paddingLeft: paddingX,
//               paddingRight: paddingX,
//             });
//           }
          
//           // Scale down logo slightly
//           const logo = navbarRef.current?.querySelector('.nav-logo img');
//           if (logo) {
//             const logoScale = gsap.utils.interpolate(1, 0.85, progress);
//             gsap.set(logo, { scale: logoScale });
//           }
          
//           // Scale down navigation text
//           const navLinks = Array.from(navbarRef.current?.querySelectorAll('.nav-links a') || []);
//           navLinks.forEach((link) => {
//             const textScale = gsap.utils.interpolate(1, 0.9, progress);
//             gsap.set(link, { scale: textScale });
//           });
          
//           // Scale down icons
//           const icons = Array.from(navbarRef.current?.querySelectorAll('.nav-icons > div') || []);
//           icons.forEach((icon) => {
//             const iconScale = gsap.utils.interpolate(1, 0.9, progress);
//             gsap.set(icon, { scale: iconScale });
//           });
//         }
//       }
//     });

//     return () => {
//       tl.kill();
//       ScrollTrigger.getAll().forEach(trigger => trigger.kill());
//     };
//   }, []);

//   return (
//     <main className="bg-white font-['Futura']">
//       {/* Navbar */}
//       <nav 
//         ref={navbarRef}
//         className="bg-white/95 backdrop-blur-md rounded-full mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
//         style={{ height: '80px' }}
//       >
//         <div className="nav-inner max-w-7xl mx-auto px-6 lg:px-9 h-full">
//           <div className="flex justify-between items-center h-full">
//             {/* Logo */}
//             <div className="nav-logo flex items-center">
//               <img src="/icon/RF.png" alt="Logo" className="h-6 w-auto object-cover" />            
//             </div>

//             {/* Center Navigation */}
//             <div className="nav-links hidden md:flex space-x-22 md:space-x-10 lg:space-x-18 xl:space-x-22 text-sm font-medium text-gray-700">
//               <Link href="/" className="hover:text-green-900 transition-modern">Home</Link>
//               <Link href="/shop" className="hover:text-green-900 transition-modern">Shop</Link>
//               <Link href="/about" className="hover:text-green-900 transition-modern">About</Link>
//               <Link href="/contact" className="hover:text-green-900 transition-modern">Contact</Link>
//             </div>

//             {/* Right Icons */}
//             <div className="nav-icons hidden md:flex items-center space-x-8 md:space-x-4 lg:space-x-6 xl:space-x-8 text-gray-700">
//               <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
//                 <img src="/icon/userIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
//               </div>
//               <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
//               <img src="/icon/searchIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
//               </div>
//               <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
//                 <img src="/icon/heartIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
//               </div>
//               <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
//                 <img src="/icon/cartIcon.png" alt="Logo" className="h-4 w-auto object-cover" />            
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <div className="h-20 bg-(--color-white)"></div>
//       <div className="relative  h-screen bg-cover bg-center" style={{backgroundImage: 'url(/bg-heropage.png)'}}>
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="relative z-10 h-full flex items-center justify-end pl-7 pr-8 md:pr-20 lg:pr-32">
//           <div className="bg-(--color-white) backdrop-blur-sm p-10 radius-20 shadow-modern max-w-lg">
//             <p className="text-[16px] uppercase tracking-[0.1em] text-(--color-primary) mb-3 font-normal">Welcome Offer</p>
//             <h1 className="text-[35px] md:text-[38px] font-bold text-(--color-olive) mb-3 leading-tight tracking-tight">
//               Save $10 on your first order!
//             </h1>
//             <p className="text-(--color-black) mb-8 font-light leading-relaxed text-[14px] md:text-[15px]">
//               Enjoy a 10% discount on your first two furniture purchases when you sign up today.
//             </p>
//             <button className="bg-(--color-olive) tracking-[0.1em] text-white px-10 py-4 rounded-full font-normal cursor-pointer transition-modern text-[12px] md:text-[14px]">
//               BUY NOW
//             </button>
//           </div>
//         </div>
//       </div>


//       {/* Affordable Style Section */}
//       <div className="py-22 px-6 lg:px-16">
//         <div className="container mx-auto text-center">
//           <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
//             Affordable Style, Sustainable Choice.
//           </h2>
//           <p className="text-[16px] text-gray-700 max-w-3xl mx-auto mb-16 leading-relaxed">
//             Elevate your home's look without breaking the bank. Our pre-loved furniture offers a unique, affordable, and eco-friendly way to shop for your space.
//           </p>
          
//           {/* Category Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mx-2 md:max-w-4xl sm:mx-auto">
            
//             <div>
//               <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
//                 <img src="/living.png" alt="Living" className="w-auto h-100 object-center group-hover:scale-105 transition-modern" />
//               </div>
//               <div className="p-8">
//                   <h3 className="text-2xl font-semibold text-(--color-primary)">Living</h3>
//               </div>
//             </div>

//             <div>
//               <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
//                 <img src="/dining.png" alt="Dining" className="w-auto h-100 object-cover group-hover:scale-105 transition-modern" />
//               </div>
//               <div className="p-8">
//                   <h3 className="text-2xl font-semibold text-(--color-primary)">Dining</h3>
//               </div>
//             </div>

//             <div>
//               <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
//                 <img src="/bedroom.png" alt="Bedroom" className="w-auto h-100 object-cover group-hover:scale-105 transition-modern" />
//               </div>
//               <div className="p-8">
//                   <h3 className="text-2xl font-semibold text-(--color-primary)">Bedroom</h3>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       <div className="border-t-[0.2px] border-(--color-olive) mx-20 text-center"></div>

//       {/* Our Products Section */}
//       <div className="py-20 px-6 lg:px-16 bg-gray-50/50">
//         <div className="container mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
//               Our Products
//             </h2>
//           <p className="text-[16px] text-gray-700 max-w-2xl mx-auto mb-16 leading-relaxed">
//               This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
//             </p>
//           </div>

//           {/* Products Grid */}
//           <div className="grid grid-cols-1  md:mx-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
//             {/* Product Cards - Reusing images for now */}
//             {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
//               <div key={index} className="bg-white radius-20 shadow-modern hover:shadow-modern-hover transition-modern overflow-hidden group">
//                 <div className="relative">
//                   <img 
//                     src={index % 3 === 0 ? "/living.png" : index % 3 === 1 ? "/dining.png" : "/bedroom.png"}
//                     alt={`Product ${index + 1}`}
//                     className="w-full h-70 object-cover group-hover:scale-105 transition-modern"
//                   />
//                   {index === 2 && (
//                     <div className="absolute top-4 left-4">
                      
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-5">
//                   <h3 className="font-bold text-(--color-olive) mb-2 text-[20px]">
//                     {index === 0 ? "Filing Cab on Wheels" : 
//                      index === 1 ? "Bent Ply Office Chair" : 
//                      index === 2 ? "Muji Style Low Chair" : 
//                      index === 3 ? "12-Layered Oak Dra..." : 
//                      `Product ${index + 1}`}
//                   </h3>
//                   <p className="text-(--color-primary) font-medium text-[18px]">₱ 12,000.00</p>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center text-(--color-primary) font-light text-[14px] ">
//                       <img src="/icon/locateIcon.png" alt="locate" className="w-auto h-4 pr-2 object-cover transition-modern" />
//                        Amanpulo
//                     </div>
//                     <div className="flex items-center space-x-3">
                      
//                       <button className="cursor-pointer">
//                        <img src="/icon/addtocart.png" alt="addtocart" className="w-12 h-11 pr-1 mb-1 object-center transition-modern" />

//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Explore More Button */}
//           <div className="text-center">
//             <button className=" shadow-sm box-sha tracking-[0.1em] text-(--color-primary) cursor-pointer border-2 border-(--color-primary) px-8 py-4 rounded-full font-medium transition-modern text-[12px]">
//               EXPLORE MORE
//             </button>
//           </div>
//         </div>
//       </div>

//             <div className="border-t-[0.2px] border-(--color-olive) mx-20 text-center"></div>


//       {/* Feature Sections */}
//       <div className="py-24 px-6 lg:px-16 mx-30">
//         <div className="container mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]  items-start gap-16">
//             {/* Left copy blocks */}
//             <div className="order-2 lg:order-1 space-y-16 lg:space-y-24 text-left xl:pt-25">
//               <div>
//                 <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive) mb-4 leading-tight">Nationwide Delivery Assistance</h3>
//                 <p className="text-gray-700 leading-relaxed text-[16px] md:text-[14px] max-w-md">
//                   Get connected with trusted couriers across the Philippines, giving you options for the most convenient and affordable delivery service for your location.
//                 </p>
//               </div>

              
//             </div>

//             {/* Center stacked images */}
//             <div className="order-1 lg:order-2 flex flex-col items-center gap-8">
//               <div className="bg-white radius-20 overflow-hidden w-full max-w-[420px]">
//                 <img src="/forfeature.png" alt="Feature 1" className="w-full h-80 object-center" />
//               </div>
//               <div>
//                 <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive) mb-4 leading-tight">Curated Quality Finds</h3>
//                 <p className="text-gray-700 leading-relaxed text-base md:text-[14px] max-w-md">
//                   Every piece listed on our platform is reviewed to ensure accurate descriptions, clear photos, and honest condition ratings.
//                 </p>
//             </div>



//             </div>

//             {/* Right copy block */}
//             <div className="order-3 lg:order-3 text-left">
//               <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive)  mb-4 leading-tight">Budget-Friendly Furniture</h3>
//               <p className="text-gray-700 leading-relaxed text-base md:text-[14px] max-w-md">
//                 Discover pre-loved and unused furniture at prices that fit your budget, without compromising on style or quality.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* REFURNISH Section */}
//       <div className="relative py-18 px-6 h-screen lg:px-16" style={{backgroundImage: 'url(/refurnishSection.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
//         <div className="absolute inset-0 bg-black/20"></div>
//         <div className="relative z-10 container mx-auto text-center">
//                 <img src="/refurnishlogoSection.png" alt="Feature 1" className=" lg:ml-110 xl:ml-150 w-100 h-auto object-center" />
          
//           <div className="flex flex-col sm:flex-row mt-2 lg:ml-110  xl:ml-150 gap-6">
//             <button className=" text-(--color-olive) cursor-pointer tracking-[0.1em] rounded-full border-2 border-(--color-olive) px-7 py-3 font-semibold transition-modern text-[12px]">
//               BUY NOW
//             </button>
            
           
//           </div>
//            <p className="text-(--color-olive) text-right pt-60 font-bold">
//               Ready to start  
//             </p>
//             <p className="text-(--color-olive) text-right text-[24px] font-bold">
//               selling? 
//             </p > 
//             <p className="text-(--color-olive) font-normal underline cursor-pointer text-[16px]  text-right transition-modern">
//              Learn More 
//             </p>
//         </div>
//       </div>

//       {/* Giving Furniture Section */}
//       <div className="py-24 px-6 lg:px-16 bg-gray-50/50">
//         <div className="container mx-auto text-center">
//           <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-5 leading-tight tracking-tight">
//             Giving Furniture a Second Home
//           </h2>
//           <p className="text-[16px] text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
//             This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
//           </p>
//           <button className="bg-(--color-olive) text-(--color-white) px-8 py-4 rounded-full shadow-modern cursor-pointer font-normal tracking-[0.1em] transition-modern text-[11px]">
//             SIGN UP NOW
//           </button>
//         </div>
//       </div>

//       <div className="border-t-[0.2px] border-(--color-olive) mt-12  text-center"></div>


//       {/* Footer */}
      // <footer className="bg-(--color-white) text-(--color-primary) py-16 px-6 lg:px-16">
      //   <div className="container mx-auto">
      //     <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      //       {/* Logo and Social */}
      //       <div>
      //           <img src="/refurnishlogoSection.png" alt="Logo" className=" w-80 pb-2 h-auto object-center" />
      //         <div className="flex space-x-6">
      //           <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
      //             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      //               <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      //             </svg>
      //           </div>
      //           <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
      //             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      //               <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
      //             </svg>
      //           </div>
      //           <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
      //             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      //               <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
      //             </svg>
      //           </div>
      //           <div className="w-12 h-12 rounded-full bg-(--color-white) flex items-center justify-center hover:bg-(--color-olive) hover:text-(--color-white) transition-modern cursor-pointer">
      //             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      //               <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      //             </svg>
      //           </div>
      //         </div>
      //       </div>

      //       {/* Information */}
      //       <div>
      //         <h4 className="text-md font-semibold mb-6">Information</h4>
      //         <ul className="space-y-4">
      //           <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Privacy</a></li>
      //           <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Terms of Use</a></li>
      //           <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">About Us</a></li>
      //         </ul>
      //       </div>

      //       {/* Contact */}
      //       <div>
      //         <h4 className="text-md font-semibold mb-6">Contact Us</h4>
      //         <ul className="space-y-4 text-sm">
      //           <li>Email: info@refurnish.com</li>
      //           <li>Mobile/Viber: +63 912 345 6789</li>
      //           <li>Messenger: @refurnish</li>
      //         </ul>
      //       </div>

            
      //       <div>
      //         <p className="text-bottom text-sm">© 2023. All rights reserved.</p>
      //       </div>
      //     </div>
          
      //   </div>
      // </footer>
//     </main>
//   );
// }