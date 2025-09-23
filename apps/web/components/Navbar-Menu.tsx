// "use client";
// import Link from 'next/link';
// import { useEffect, useRef } from 'react';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// // Register ScrollTrigger plugin
// if (typeof window !== 'undefined') {
//   gsap.registerPlugin(ScrollTrigger);
// }

// interface NavbarMenuProps {
//   onWishlistClick?: () => void;
//   onCartClick?: () => void;
// }

// export default function NavbarMenu({
//   onWishlistClick,
//   onCartClick
// }: NavbarMenuProps) {
//   const navbarRef = useRef<HTMLElement>(null);

//   useEffect(() => {
//     if (!navbarRef.current) return;

//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: "main",
//         start: "top top",
//         end: "+=100",
//         scrub: 0.5,
//         onUpdate: (self) => {
//           const progress = self.progress;
//           const height = gsap.utils.interpolate(72, 60, progress);
//           const marginX = gsap.utils.interpolate(20, 16, progress);
//           const marginY = gsap.utils.interpolate(10, 16, progress);
//           const paddingX = gsap.utils.interpolate(12, 10, progress);
          
//           gsap.set(navbarRef.current, {
//             height: height,
//             marginLeft: marginX,
//             marginRight: marginX,
//             marginTop: marginY,
//             marginBottom: marginY,
//           });
          
//           const innerContainer = navbarRef.current?.querySelector('.nav-inner');
//           if (innerContainer) {
//             gsap.set(innerContainer, {
//               paddingLeft: paddingX,
//               paddingRight: paddingX,
//             });
//           }
          
//           const logo = navbarRef.current?.querySelector('.nav-logo img');
//           if (logo) {
//             const logoScale = gsap.utils.interpolate(1, 0.85, progress);
//             gsap.set(logo, { scale: logoScale });
//           }
          
//           const icons = Array.from(navbarRef.current?.querySelectorAll('.nav-icons > *') || []);
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
//     <nav
//       ref={navbarRef}
//       className="bg-(--color-white) mt-2 backdrop-blur-md rounded-full mx-3 sm:mx-6 md:mx-20 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
//       style={{ height: 65 }}
//     >
//       <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 h-full">
//         <div className="flex justify-between items-center h-full gap-3">
//           <Link href="/landing" className="nav-logo flex items-center flex-shrink-0">
//             <img src="/icon/RF.png" alt="Logo" className="h-6 sm:h-7 px-4 w-auto object-cover" />
//           </Link>
//           <div className="nav-icons flex items-center space-x-3 sm:space-x-4 text-gray-700">
//             <Link href="/cart-details/wishlist" >
//               <button className="w-8 h-8 sm:w-9 cursor-pointer sm:h-9 flex items-center justify-center hover:text-(--color-olive)">
//                 <img src="/icon/heartIcon.png" alt="Wishlist" className="h-4 w-auto" />
//               </button>
//             </Link>
//             <Link href="/cart-details/cart" >
//               <button className="w-8 h-8 sm:w-10 cursor-pointer sm:h-10 flex items-center justify-center hover:text-(--color-olive)">
//                 <img src="/icon/cartIcon.png" alt="Cart" className="h-4 w-auto" />
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
"use client";
import Link from 'next/link';
import { useRef } from 'react';

interface NavbarMenuProps {
  onWishlistClick?: () => void;
  onCartClick?: () => void;
}

export default function NavbarMenu({
  onWishlistClick,
  onCartClick
}: NavbarMenuProps) {
  const navbarRef = useRef<HTMLElement>(null);

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
