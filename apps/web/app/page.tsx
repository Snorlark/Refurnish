"use client";
import Image from "next/image";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWishlistContext } from '../contexts/WishlistContext';
import Navbar from '../components/Navbar-Products';
import WishlistSidebar from '../components/WishlistSidebar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import CartSidebar from '../components/CartSidebar';
import ChatBubble from '../components/ChatBubble';
import { useCartContext } from '../contexts/CartContext';
import { saleProducts, newProducts, featuredProducts, forSwapProducts } from '../data/products';


if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const navbarRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  

  // Use shared hooks
  const cart = useCartContext();
  const wishlist = useWishlistContext();
  
  const heroSlides = [
    {
      image: '/bg-heropage.png',
      isRefurnishSlide: true
    },
    {
      image: '/swap-pic.png',
      scrollTo: 'for-swap'
    },
    {
      image: '/sale-pic.png', 
      scrollTo: 'on-sale'
    }
  ];

 // Navbar animation 
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
          const height = gsap.utils.interpolate(80, 60, progress);
          const marginX = gsap.utils.interpolate(32, 18, progress);
          const marginY = gsap.utils.interpolate(0, 16, progress);
          const paddingX = gsap.utils.interpolate(26, 16, progress);
          
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
          
          const icons = Array.from(navbarRef.current?.querySelectorAll('.nav-icons > div') || []);
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

  // Search functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/product-catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };




  useEffect(() => {
    if (!navbarRef.current) return;

    // Create the shrinking animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "+=100",
        scrub: 0.5,
        onUpdate: (self) => {
          // Update navbar styles based on scroll progress
          const progress = self.progress;
          
          // Shrink height
          const height = gsap.utils.interpolate(80, 60, progress);
          
          // Shrink horizontal margins
          const marginX = gsap.utils.interpolate(32, 18, progress);
          const marginY = gsap.utils.interpolate(0, 16, progress);
          
          // Adjust padding
          const paddingX = gsap.utils.interpolate(26, 16, progress);
        
          
          // Apply styles
          gsap.set(navbarRef.current, {
            height: height,
            marginLeft: marginX,
            marginRight: marginX,
            marginTop: marginY,
            marginBottom: marginY,
          });
          
          // Update inner container padding
          const innerContainer = navbarRef.current?.querySelector('.nav-inner');
          if (innerContainer) {
            gsap.set(innerContainer, {
              paddingLeft: paddingX,
              paddingRight: paddingX,
            });
          }
          
          // Scale down logo slightly
          const logo = navbarRef.current?.querySelector('.nav-logo img');
          if (logo) {
            const logoScale = gsap.utils.interpolate(1, 0.85, progress);
            gsap.set(logo, { scale: logoScale });
          }
          
          // Scale down navigation text
          const navLinks = Array.from(navbarRef.current?.querySelectorAll('.nav-links a') || []);
          navLinks.forEach((link) => {
            const textScale = gsap.utils.interpolate(1, 0.9, progress);
            gsap.set(link, { scale: textScale });
          });
          
          // Scale down icons
          const icons = Array.from(navbarRef.current?.querySelectorAll('.nav-icons > div') || []);
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

  return (
     <>
     {/* bg-gradient-to-br from-white to-[#e1e1b2] */}
      {/* bg-gradient-to-r from-white via-[#949478] to-[#ffffff] */}
           {/* bg-gradient-to-r from-[#fffdec] via-[#f7ffd9de] via-[#e9f8ae] to-[#effcd1]  */}
           
      {/* bg-gradient-to-r from-[#fffef3] via-[#e8e9c2de]  to-[#edf5da] 
      animate-gradient-wave */}

             {/* bg-gradient-to-r from-[#fffef3] via-[#fbfdccde]  to-[#f5ffdd]  */}

    {/* aurora-bg */}

    <main className="
      bg-gradient-to-r from-[#fffef3] to-[#eef0c4de]  
      animate-gradient-wave 
      font-sans">
      {/* Navbar */}
      <Navbar 
              variant="shop"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              onAuthClick={() => setIsAuthModalOpen(true)}
              cartItemsCount={cart.cartCount}
              wishlistItemsCount={wishlist.wishlistCount}
              onCartClick={() => cart.setIsCartOpen(true)}
              onWishlistClick={() => wishlist.setIsWishlistOpen(true)}
            />

      {/* Hero Section */}
      {/* <div className="h-20 bg-(--color-white)"></div> */}
      <div className="relative  h-screen bg-cover bg-center" style={{backgroundImage: 'url(/bg-heropage.png)'}}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 h-full flex items-center justify-end pl-7 pr-8 md:pr-20 lg:pr-32">
          <div className="bg-(--color-white) backdrop-blur-sm p-10 radius-20 shadow-modern max-w-lg">
            <p className="text-[16px] uppercase tracking-[0.1em] text-(--color-primary) mb-3 font-normal">Welcome Offer</p>
            <h1 className="text-[35px] md:text-[38px] font-bold text-(--color-olive) mb-3 leading-tight tracking-tight">
              Save $10 on your first order!
            </h1>
            <p className="text-(--color-black) mb-8 font-light leading-relaxed text-[14px] md:text-[15px]">
              Enjoy a 10% discount on your first two furniture purchases when you sign up today.
            </p>
            <Link href='/shop'>
            <button className="bg-(--color-olive) hover:text-(--color-white) hover:bg-(--color-primary) hover:font-bold hover:translate-y-1 hover:tracking-[0.15em] tracking-[0.1em] text-white px-8 py-4 rounded-full font-normal cursor-pointer transition-modern text-[12px] md:text-[14px]">
             SHOP NOW &nbsp; ➤
            </button>
            </Link>
          </div>
        </div>
      </div>


      {/* Affordable Style Section */}
      <div className="py-22 px-6 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
            Affordable Style, Sustainable Choice.
          </h2>
          <p className="text-[16px] text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
            Elevate your home's look without breaking the bank. Our pre-loved furniture offers a unique, affordable, and eco-friendly way to shop for your space.
          </p>
          
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mx-2 md:max-w-4xl sm:mx-auto">
            
            <div>
              <div className="bg-white radius-20 shadow-modern  overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/living.png" alt="Living" className="w-full h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-8">
                  <h3 className="text-[18px] font-semibold text-(--color-primary)">Living</h3>
              </div>
            </div>

            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/dining.png" alt="Dining" className="w-full h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-8">
                  <h3 className="text-[18px] font-semibold text-(--color-primary)">Dining</h3>
              </div>
            </div>

            <div>
              <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
                <img src="/bedroom.png" alt="Bedroom" className="w-full h-100 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <div className="p-8">
                  <h3 className="text-[18px] font-semibold text-(--color-primary)">Bedroom</h3>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t-[0.2px] border-(--color-olive) mx-20 text-center"></div>

      {/* Our Products Section */}
      <div className="py-20 px-6 lg:px-16 ">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
              Our Products
            </h2>
          <p className="text-[16px] text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
              This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:my-8 md:mx-20 gap-6">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-55 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <button 
                    onClick={() => wishlist.toggleWishlist(product)}
                    className={`absolute cursor-pointer top-3 right-3 p-2 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white transform hover:scale-110 ${
                      wishlist.isInWishlist(product.id) ? 'bg-red-100' : 'bg-white/80'
                    }`}
                  >
                    <img 
                      src="/icon/heartIcon.png" 
                      alt="wishlist" 
                      className={`w-4 h-4 ${wishlist.isInWishlist(product.id) ? 'filter brightness-0 saturate-100 invert-[0.2] sepia-[1] saturate-[5] hue-rotate-[340deg]' : ''}`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-(--color-olive) text-md mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-(--color-primary) font-bold text-base mb-2">{product.price}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 text-xs">
                      <img src="/icon/locateIcon.png" alt="location" className="w-3 h-4 mr-2" />
                      {product.location}
                    </div>
                    <button 
                      onClick={() => cart.addToCart(product)}
                      className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 transform hover:scale-110"
                    >
                      <img src="/icon/addtocart.png" alt="add to cart" className="w-auto h-7" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          

          {/* Explore More Button */}
          <div className="text-center">
            <Link href='product-catalog-sale'>
            <button className=" shadow-sm box-sha tracking-[0.1em] text-(--color-primary) hover:translate-y-2  hover:text-(--color-white) cursor-pointer border-2 hover:bg-(--color-primary) border-(--color-primary) px-8 py-4 rounded-full font-medium transition-modern text-[12px]">
              EXPLORE MORE
            </button>
            </Link>
          </div>
        </div>
      </div>

            <div className="border-t-[0.2px] border-(--color-olive) mx-20 text-center"></div>


      {/* Feature Sections */}
      <div className="py-24 px-6 lg:px-16 mx-30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]  items-start gap-16">
            {/* Left copy blocks */}
            <div className="order-2 lg:order-1 space-y-16 lg:space-y-24 text-left xl:pt-25">
              <div>
                <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive) mb-4 leading-tight">Nationwide Delivery Assistance</h3>
                <p className="text-gray-700 leading-relaxed text-[16px] md:text-[14px] max-w-md">
                  Get connected with trusted couriers across the Philippines, giving you options for the most convenient and affordable delivery service for your location.
                </p>
              </div>

              
            </div>

            {/* Center stacked images */}
            <div className="order-1 lg:order-2 flex flex-col items-center gap-8">
              <div className="bg-white radius-20 overflow-hidden w-full max-w-[420px]">
                <img src="/forfeature.png" alt="Feature 1" className="w-full h-80 object-center" />
              </div>
              <div>
                <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive) mb-4 leading-tight">Curated Quality Finds</h3>
                <p className="text-gray-700 leading-relaxed text-base md:text-[14px] max-w-md">
                  Every piece listed on our platform is reviewed to ensure accurate descriptions, clear photos, and honest condition ratings.
                </p>
            </div>



            </div>

            {/* Right copy block */}
            <div className="order-3 lg:order-3 text-left">
              <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive)  mb-4 leading-tight">Budget-Friendly & Sustainable Furniture</h3>
              <p className="text-gray-700 leading-relaxed text-base md:text-[14px] max-w-md">
                Discover pre-loved and unused furniture that fits your budget without compromising on quality and style. With our furniture swapping initiative, you can also trade items with other users to refresh your home.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REFURNISH Section */}
      <div className="relative py-18 px-6 h-screen lg:px-16" style={{backgroundImage: 'url(/refurnishSection.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
                <img src="/refurnishlogoSection.png" alt="Feature 1" className=" lg:ml-110 xl:ml-150 w-100 h-auto object-center" />
          
          <div className="flex flex-col sm:flex-row mt-2 lg:ml-110  xl:ml-150 gap-6">
            <Link href='/login'>
            <button className=" text-(--color-olive) hover:text-(--color-white) hover:bg-(--color-olive) hover:scale-105 hover:font-medium hover:translate-y-1 cursor-pointer tracking-[0.1em] rounded-full border-2 border-(--color-olive) px-7 py-3 font-semibold transition-modern text-[12px]">
              BUY NOW
            </button>
            </Link>
            
           
          </div>
           <p className="text-(--color-olive) text-right pt-60 font-bold">
              Ready to start  
            </p>
            <p className="text-(--color-olive) text-right text-[24px] font-bold">
              selling? 
            </p > 
            <p className="text-(--color-olive) font-normal underline cursor-pointer text-[16px]  text-right transition-modern">
             Learn More 
            </p>
        </div>
      </div>

      {/* Giving Furniture Section */}
      <div className="py-24 px-6 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-5 leading-tight tracking-tight">
            Giving Furniture a Second Home
          </h2>
          <p className="text-[16px] text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
          </p>
          <button className="bg-(--color-olive)  hover:text-(--color-white) hover:bg-(--color-primary)  hover:font-bold hover:translate-y-1 hover:tracking-[0.15em] text-(--color-white) px-8 py-4 rounded-full shadow-modern cursor-pointer font-normal tracking-[0.1em] transition-modern text-[11px]">
            SIGN UP NOW
          </button>
        </div>
      </div>

    {/* footer */}
    <Footer />


      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cart.isCartOpen}
        onClose={() => cart.setIsCartOpen(false)}
        cartItems={cart.cartItems}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeFromCart}
        totalPrice={cart.getTotalPrice()}
        isBackendAvailable={cart.isBackendAvailable}
      />

      {/* Wishlist Sidebar */}
          <WishlistSidebar 
            isOpen={wishlist.isWishlistOpen}
            onClose={() => wishlist.setIsWishlistOpen(false)}
            wishlistItems={wishlist.wishlistItems}
            onRemoveItem={wishlist.removeFromWishlist}
            onAddToCart={cart.addToCart}
      />

      {/* Auth Modal */}
            <AuthModal 
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
      
      {/* Chat Bubble */}
      <ChatBubble />
    </main>
   </>
  );
}


// "use client";
// import Image from "next/image";
// import Link from 'next/link';
// import { useEffect, useRef, useState } from 'react';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useWishlist } from '../hooks/useWishlist';
// import Navbar from '../components/Navbar-Products';
// import WishlistSidebar from '../components/WishlistSidebar';
// import Footer from '../components/Footer';
// import AuthModal from '../components/AuthModal';
// import CartSidebar from '../components/CartSidebar';
// import ChatBubble from '../components/ChatBubble';
// import { useCart } from '../hooks/useCart';
// import { saleProducts, newProducts, featuredProducts, forSwapProducts } from '../data/products';


// if (typeof window !== 'undefined') {
//   gsap.registerPlugin(ScrollTrigger);
// }

// export default function Home() {
//   const navbarRef = useRef<HTMLElement>(null);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  

//   // Use shared hooks
//   const cart = useCart();
//   const wishlist = useWishlist();
  
//   const heroSlides = [
//     {
//       image: '/bg-heropage.png',
//       isRefurnishSlide: true
//     },
//     {
//       image: '/swap-pic.png',
//       scrollTo: 'for-swap'
//     },
//     {
//       image: '/sale-pic.png', 
//       scrollTo: 'on-sale'
//     }
//   ];

//  // Navbar animation 
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
//           const height = gsap.utils.interpolate(80, 60, progress);
//           const marginX = gsap.utils.interpolate(32, 18, progress);
//           const marginY = gsap.utils.interpolate(0, 16, progress);
//           const paddingX = gsap.utils.interpolate(26, 16, progress);
          
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
          
//           const navLinks = Array.from(navbarRef.current?.querySelectorAll('.nav-links a') || []);
//           navLinks.forEach((link) => {
//             const textScale = gsap.utils.interpolate(1, 0.9, progress);
//             gsap.set(link, { scale: textScale });
//           });
          
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

//   // Search functionality
//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       window.location.href = `/product-catalog?search=${encodeURIComponent(searchQuery)}`;
//     }
//   };




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
//      <>
//     <main className="bg-white font-sans">
//       {/* Navbar */}
//       <Navbar 
//               variant="shop"
//               searchQuery={searchQuery}
//               onSearchChange={setSearchQuery}
//               onSearchSubmit={handleSearchSubmit}
//               onAuthClick={() => setIsAuthModalOpen(true)}
//               cartItemsCount={cart.cartCount}
//               wishlistItemsCount={wishlist.wishlistCount}
//               onCartClick={() => cart.setIsCartOpen(true)}
//               onWishlistClick={() => wishlist.setIsWishlistOpen(true)}
//             />

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
//             <Link href='/login'>
//             <button className="bg-(--color-olive) hover:text-(--color-white) hover:bg-(--color-primary) hover:font-bold hover:translate-y-1 hover:tracking-[0.15em] tracking-[0.1em] text-white px-10 py-4 rounded-full font-normal cursor-pointer transition-modern text-[12px] md:text-[14px]">
//               BUY NOW
//             </button>
//             </Link>
//           </div>
//         </div>
//       </div>


//       {/* Affordable Style Section */}
//       <div className="py-22 px-6 lg:px-16">
//         <div className="container mx-auto text-center">
//           <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
//             Affordable Style, Sustainable Choice.
//           </h2>
//           <p className="text-[16px] text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
//             Elevate your home's look without breaking the bank. Our pre-loved furniture offers a unique, affordable, and eco-friendly way to shop for your space.
//           </p>
          
//           {/* Category Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mx-2 md:max-w-4xl sm:mx-auto">
            
//             <div>
//               <div className="bg-white radius-20 shadow-modern  overflow-hidden hover:shadow-modern-hover transition-modern group">
//                 <img src="/living.png" alt="Living" className="w-full h-100 object-cover group-hover:scale-105 transition-modern" />
//               </div>
//               <div className="p-8">
//                   <h3 className="text-[18px] font-semibold text-(--color-primary)">Living</h3>
//               </div>
//             </div>

//             <div>
//               <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
//                 <img src="/dining.png" alt="Dining" className="w-full h-100 object-cover group-hover:scale-105 transition-modern" />
//               </div>
//               <div className="p-8">
//                   <h3 className="text-[18px] font-semibold text-(--color-primary)">Dining</h3>
//               </div>
//             </div>

//             <div>
//               <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
//                 <img src="/bedroom.png" alt="Bedroom" className="w-full h-100 object-cover group-hover:scale-105 transition-modern" />
//               </div>
//               <div className="p-8">
//                   <h3 className="text-[18px] font-semibold text-(--color-primary)">Bedroom</h3>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       <div className="border-t-[0.2px] border-(--color-olive) mx-20 text-center"></div>

//       {/* Our Products Section */}
//       <div className="py-20 px-6 lg:px-16 bg-gray-50/50">
//         <div className="container mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-2xl md:text-[32px] font-bold text-(--color-primary) mb-7 leading-tight tracking-tight">
//               Our Products
//             </h2>
//           <p className="text-[16px] text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
//               This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
//             </p>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:my-8 md:mx-20 gap-6">
//             {featuredProducts.map((product, index) => (
//               <div 
//                 key={product.id} 
//                 className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2"
//                 style={{
//                   animationDelay: `${index * 0.1}s`
//                 }}
//               >
//                 <div className="relative overflow-hidden">
//                   <img 
//                     src={product.image}
//                     alt={product.name}
//                     className="w-full h-55 object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                   <button 
//                     onClick={() => wishlist.toggleWishlist(product)}
//                     className={`absolute cursor-pointer top-3 right-3 p-2 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white transform hover:scale-110 ${
//                       wishlist.isInWishlist(product.id) ? 'bg-red-100' : 'bg-white/80'
//                     }`}
//                   >
//                     <img 
//                       src="/icon/heartIcon.png" 
//                       alt="wishlist" 
//                       className={`w-4 h-4 ${wishlist.isInWishlist(product.id) ? 'filter brightness-0 saturate-100 invert-[0.2] sepia-[1] saturate-[5] hue-rotate-[340deg]' : ''}`}
//                     />
//                   </button>
//                 </div>
//                 <div className="p-4">
//                   <h3 className="font-semibold text-(--color-olive) text-md mb-2 line-clamp-2">{product.name}</h3>
//                   <p className="text-(--color-primary) font-bold text-base mb-2">{product.price}</p>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center text-gray-600 text-xs">
//                       <img src="/icon/locateIcon.png" alt="location" className="w-3 h-4 mr-2" />
//                       {product.location}
//                     </div>
//                     <button 
//                       onClick={() => cart.addToCart(product)}
//                       className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 transform hover:scale-110"
//                     >
//                       <img src="/icon/addtocart.png" alt="add to cart" className="w-auto h-7" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
          

//           {/* Explore More Button */}
//           <div className="text-center">
//             <Link href='product-catalog-sale'>
//             <button className=" shadow-sm box-sha tracking-[0.1em] text-(--color-primary) hover:translate-y-2  hover:text-(--color-white) cursor-pointer border-2 hover:bg-(--color-primary) border-(--color-primary) px-8 py-4 rounded-full font-medium transition-modern text-[12px]">
//               EXPLORE MORE
//             </button>
//             </Link>
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
//               <h3 className="text-2xl md:text-[28px] font-medium text-(--color-olive)  mb-4 leading-tight">Budget-Friendly & Sustainable Furniture</h3>
//               <p className="text-gray-700 leading-relaxed text-base md:text-[14px] max-w-md">
//                 Discover pre-loved and unused furniture that fits your budget without compromising on quality and style. With our furniture swapping initiative, you can also trade items with other users to refresh your home.
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
//             <Link href='/login'>
//             <button className=" text-(--color-olive) hover:text-(--color-white) hover:bg-(--color-olive) hover:scale-105 hover:font-medium hover:translate-y-1 cursor-pointer tracking-[0.1em] rounded-full border-2 border-(--color-olive) px-7 py-3 font-semibold transition-modern text-[12px]">
//               BUY NOW
//             </button>
//             </Link>
            
           
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
//           <button className="bg-(--color-olive)  hover:text-(--color-white) hover:bg-(--color-primary)  hover:font-bold hover:translate-y-1 hover:tracking-[0.15em] text-(--color-white) px-8 py-4 rounded-full shadow-modern cursor-pointer font-normal tracking-[0.1em] transition-modern text-[11px]">
//             SIGN UP NOW
//           </button>
//         </div>
//       </div>

//     {/* footer */}
//     <Footer />


      
//       {/* Cart Sidebar */}
//       <CartSidebar 
//         isOpen={cart.isCartOpen}
//         onClose={() => cart.setIsCartOpen(false)}
//         cartItems={cart.cartItems}
//         onUpdateQuantity={cart.updateQuantity}
//         onRemoveItem={cart.removeFromCart}
//         totalPrice={cart.getTotalPrice()}
//       />

//       {/* Wishlist Sidebar */}
//           <WishlistSidebar 
//             isOpen={wishlist.isWishlistOpen}
//             onClose={() => wishlist.setIsWishlistOpen(false)}
//             wishlistItems={wishlist.wishlistItems}
//             onRemoveItem={wishlist.removeFromWishlist}
//             onAddToCart={cart.addToCart}
//       />

//       {/* Auth Modal */}
//             <AuthModal 
//               isOpen={isAuthModalOpen}
//               onClose={() => setIsAuthModalOpen(false)}
//             />
      
//       {/* Chat Bubble */}
//       <ChatBubble />
//     </main>
//    </>
//   );
// }
