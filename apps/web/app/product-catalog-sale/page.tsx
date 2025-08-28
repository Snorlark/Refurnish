"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

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
  const gridRef = useRef<HTMLDivElement>(null);
  const categories = ["ALL", ...Object.keys(productCatalog)];
  const defaultCategory = "SALE";
  const [isSalePage, setIsSalePage] = useState(true); // since this is the Sale page
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

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
        {/* Import and use the Navbar component */}
        <Navbar />

        {/* CATEGORY TABS (centered) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-9">
          <div className="mt-3 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm">
            {categories.map((c) => {
              const active = c === activeCategory;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`relative pb-1 sm:pb-2 transition-colors ${active ? "font-semibold text-black" : "text-gray-600 hover:text-gray-900"
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
        </section>

        {/* PRODUCTS GRID */}
        <section className="max-w-7xl mx-auto md:mx-30 px-6 lg:px-9 mt-8">
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                No products in this category yet.
              </div>
            ) : (
              filteredProducts.map((p) => (
                <article key={`${p.id}-${p.title}`} className="product-card bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
                  <div className="relative">
                    <Image src={p.image} alt={p.title} width={600} height={420} className="w-full h-44 object-cover" />
                  </div>

                  <div className="p-4">
                    <h3 className="text-[15px] text-(--color-olive) font-semibold">{p.title}</h3>
                    <div className="mt-1 text-[14px]">{p.price}</div>
                    <div className="mt-2 flex items-center gap-2 text-[12px] text-gray-600">
                      <img src="/icon/locateIcon.png" alt="Location" className="w-4 h-4" />
                      <span>{p.location}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* FOOTER */}
        <Footer />

      </main>
    </>
  );
}
