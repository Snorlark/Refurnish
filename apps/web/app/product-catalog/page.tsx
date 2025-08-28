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
  price: string;
  image: string;
  location: string;
};

const productCatalog: Record<string, Product[]> = {
  CHAIRS: [
    { id: 1, title: "Wooden Chair", price: "₱ 12,000.00", image: "/bedroom.png", location: "Amanpulo" },
    { id: 2, title: "Classic Rattan Chair", price: "₱ 15,500.00", image: "/bedroom.png", location: "Cebu" },
    { id: 3, title: "Wooden Chair", price: "₱ 12,000.00", image: "/bedroom.png", location: "Amanpulo" },
    { id: 4, title: "Classic Rattan Chair", price: "₱ 15,500.00", image: "/bedroom.png", location: "Cebu" },
    { id: 5, title: "Wooden Chair", price: "₱ 12,000.00", image: "/bedroom.png", location: "Amanpulo" },
    { id: 6, title: "Classic Rattan Chair", price: "₱ 15,500.00", image: "/bedroom.png", location: "Cebu" },
  ],
  TABLES: [
    { id: 3, title: "Dining Table", price: "₱ 20,000.00", image: "/bedroom.png", location: "Makati" },
    { id: 4, title: "Coffee Table", price: "₱ 8,000.00", image: "/bedroom.png", location: "Tagaytay" },
  ],
  SOFA: [
    { id: 5, title: "Modern Sofa", price: "₱ 30,000.00", image: "/living.png", location: "Cebu" },
  ],
  CABINET: [
    { id: 6, title: "Classic Cabinet", price: "₱ 15,000.00", image: "/living.png", location: "Davao" },
  ],
  DECOR: [
    { id: 7, title: "Decorative Vase", price: "₱ 5,000.00", image: "/living.png", location: "Palawan" },
  ],
  MIRROR: [
    { id: 8, title: "Wall Mirror", price: "₱ 8,500.00", image: "/dining.png", location: "Tagaytay" },
  ],
};

export default function ChairsCatalogPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const categories = ["ALL", ...Object.keys(productCatalog)];
  const defaultCategory = productCatalog["CHAIRS"] ? "CHAIRS" : "ALL";
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);

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

  // Filtering logic (curated & scalable)
  const filteredProducts: Product[] =
    activeCategory === "ALL"
      ? Object.values(productCatalog).flat()
      : productCatalog[activeCategory] ?? [];

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
