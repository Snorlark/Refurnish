"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Navbar() {
  const navbarRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);


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
    }, navEl);

    return () => ctx.revert();
  }, []);

  return (
    <>
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

            {/* Search bar */}
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
              <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-(--color-olive)">
                <img src="/icon/userIcon.png" alt="Profile" className="h-4 w-auto" />
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center cursor-pointer justify-center hover:text-(--color-olive)"
                >
                <img src="/icon/menuIcon.png" alt="menu" className="h-4 w-auto" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20 sm:h-24" /> {/* MENU MODAL */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-lg w-80 max-w-sm p-6 flex flex-col gap-4 text-center"
            >
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/account"
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <Link
                  href="/chat"
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Chat
                </Link>
                <Link
                  href="/seller-dashboard"
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Seller Dashboard
                </Link>
                <button
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: add logout logic
                  }}
                >
                  Log Out
                </button>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}