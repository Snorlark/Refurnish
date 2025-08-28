"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type SwapItem = {
  id: number;
  title: string;
  image: string;
  location: string;
  swapFor: string; // New field for what the seller wants
};

const swapCatalog: Record<string, SwapItem[]> = {
  CHAIRS: [
    { id: 1, title: "Wooden Chair", image: "/bedroom.png", location: "Amanpulo", swapFor: "Coffee Table" },
    { id: 2, title: "Classic Rattan Chair", image: "/bedroom.png", location: "Cebu", swapFor: "Floor Lamp" },
  ],
  TABLES: [
    { id: 3, title: "Dining Table", image: "/bedroom.png", location: "Makati", swapFor: "Bookshelf" },
    { id: 4, title: "Coffee Table", image: "/bedroom.png", location: "Tagaytay", swapFor: "Side Chair" },
  ],
  SOFA: [
    { id: 5, title: "Modern Sofa", image: "/living.png", location: "Cebu", swapFor: "Rug" },
  ],
  CABINET: [
    { id: 6, title: "Classic Cabinet", image: "/living.png", location: "Davao", swapFor: "Bar Stool" },
  ],
  DECOR: [
    { id: 7, title: "Decorative Vase", image: "/living.png", location: "Palawan", swapFor: "Wall Art" },
  ],
  MIRROR: [
    { id: 8, title: "Wall Mirror", image: "/dining.png", location: "Tagaytay", swapFor: "Console Table" },
  ],
  
  LAMP: [
    
  ],
  VANITY: [
    
  ],

  SHELVES: [
    
  ],

};

export default function SwapCatalogPage() {
  const navbarRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categories = ["ALL", ...Object.keys(swapCatalog)];
  const [isSwapPage, setIsSwapPage] = useState(true); // since this is the Swap page
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Navbar animation
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


  // Grid animation
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
  const filteredProducts: SwapItem[] =
    isSwapPage
      ? // Sale page: filter by category under SALE
        (activeCategory === "ALL"
          ? Object.values(swapCatalog).flat()
          : swapCatalog[activeCategory] ?? [])
      : // Non-sale page logic (future proof if reused elsewhere)
        (activeCategory === "ALL"
          ? Object.values(swapCatalog).flat()
          : swapCatalog[activeCategory] ?? []);


  return (
    <>
    <main className="bg-white font-['Futura'] min-h-screen">
      {/* NAVBAR */}
      
        <nav
            ref={navbarRef}
            className="bg-white/95 backdrop-blur-md rounded-full mx-3 sm:mx-6 md:mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
            style={{ height: 72 }}
          >
            <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-9 h-full">
              <div className="flex justify-between items-center h-full gap-3">
                {/* Logo */}
                <Link href="/" className="nav-logo flex items-center flex-shrink-0">
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

      {/* CATEGORY TABS */}
     <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-9">

           {/* SALE & SWAP FILTERS */}
          <div className="mt-6 flex justify-center mb-5 gap-4">
            
             <Link
              href="/product-catalog-sale"
              className="px-6 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Sale
            </Link>

            <button
              onClick={() => setIsSwapPage(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isSwapPage ? "bg-(--color-primary) text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Swap
            </button>
          </div>

          <div className="border-t-[0.1px] border-(--color-primary) mx-5 lg:mx-40 text-center opacity-50"></div>

          {/* CATEGORY TABS (centered) */}
          <div className="mt-3 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm">
            {categories.map((c) => {
            const active = c === activeCategory;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`relative pb-1 sm:pb-2 transition-colors ${
                  active ? "font-semibold text-(--color-primary)" : "text-gray-600 hover:text-gray-900"
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

      {/* SWAP GRID */}
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
                        <div className="mt-2 flex items-center gap-2 text-[14px] text-(--color-black)">
                          <img src="/icon/swapIcon.png" alt="Swap" className="w-4 h-auto" />
                          <span>{p.swapFor}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[13px] text-gray-600">
                          <img src="/icon/locateIcon.png" alt="Location" className="w-4 h-auto" />
                          <span>{p.location}</span>
                        </div>
                      </div>
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
