"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from '../../components/Footer';
import { useWishlist } from '../../hooks/useWishlist';
import Navbar from '../../components/Navbar-Products';
import WishlistSidebar from '../../components/WishlistSidebar';
import CartSidebar from '../../components/CartSidebar';
import ChatBubble from '../../components/ChatBubble';
import { useCart } from '../../hooks/useCart';
import { saleProducts, newProducts, featuredProducts, forSwapProducts } from '../../data/products';


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Product = {
  id: number;
  title: string;
  image: string;
  location: string;
  price: number;
  seller: string;
  condition: string;
  material: string;
  age: string;
  description: string;
  images: string[];
};

const currentProduct: Product = {
  id: 1,
  title: "360° Swivel Wooden Office Chair",
  image: "/products/chair/view1.jpg",
  location: "Cavite",
  price: 500,
  seller: "Bruno Mars",
  condition: "Good - Light surface wear on seat, fully functional",
  material: "Acacia Wood, Powder-Coated Steel",
  age: "Approx. 35 years",
  description: "These are mid-century style chairs that were part of my grandparents' dining set from the late 1980s. They're crafted with acacia wood seats and powder-coated metal legs. The chairs are in good condition with only light surface wear on the seats but are fully functional. I'm selling them because we renovated our dining area and switched to a bigger table set.",
  images: ["/products/chair/view1.jpg", "/products/chair/view2.jpg", "/products/chair/view4.jpg", "/products/chair/view5.jpg", "/products/chair/view3.jpg"  ]
};

const relatedProducts = [
  { id: 2, title: "Folding Trolley", image: "/living.png", location: "Amanpulo", price: 12000 },
  { id: 3, title: "Coffee Table", image: "/dining.png", location: "Amanpulo", price: 12000 }
];

const similarProducts = [
  { id: 4, title: "Folding Trolley", image: "/living.png", location: "Amanpulo", price: 12000 },
  { id: 5, title: "Wooden Cabinet", image: "/bedroom.png", location: "Amanpulo", price: 12000 },
  { id: 6, title: "Half-moon Table", image: "/dining.png", location: "Amanpulo", price: 12000 },
  { id: 7, title: "Cinema Seats", image: "/living.png", location: "Amanpulo", price: 12000 },
  { id: 8, title: "Metal Shelving Unit", image: "/bedroom.png", location: "Amanpulo", price: 12000 }
];

export default function ItemViewSalePage() {
  const navbarRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [similarProductsIndex, setSimilarProductsIndex] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Use shared hooks
  const cart = useCart();
  const wishlist = useWishlist();
  
 // Navbar animation (reused from Home)
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === currentProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentProduct.images.length - 1 : prev - 1
    );
  };

  const nextSimilarProducts = () => {
    setSimilarProductsIndex((prev) => 
      prev + 3 >= similarProducts.length ? 0 : prev + 3
    );
  };

  const prevSimilarProducts = () => {
    setSimilarProductsIndex((prev) => 
      prev - 3 < 0 ? Math.max(0, similarProducts.length - 3) : prev - 3
    );
  };

  // Check scroll position and update button visibility
  const checkScrollPosition = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    checkScrollPosition();
  };

  // Scroll functions
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Check scroll position on mount and window resize
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

  return (
    <>
      <main className="bg-white font-sans min-h-screen transition-all ease-in-out duration-300">
        {/* NAVBAR */}
        <nav
          ref={navbarRef}
          className="bg-white/95 backdrop-blur-md rounded-full mx-3 sm:mx-6 md:mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
          style={{ height: 72 }}
        >
          <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-9 h-full">
            <div className="flex justify-between items-center h-full gap-3">
              <Link href="/landing" className="nav-logo flex items-center flex-shrink-0">
                <img src="/icon/RF.png" alt="Logo" className="h-6 sm:h-7 w-auto object-cover" />
              </Link>

              <div className="hidden sm:flex flex-1 mx-3 sm:mx-6">
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 sm:px-5 h-9 w-full">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="7" strokeWidth="2" />
                    <path d="M21 21l-3.5-3.5" strokeWidth="2" />
                  </svg>
                  <input className="bg-transparent outline-none text-sm flex-1" placeholder="Search" />
                </div>
              </div>

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

        <div className="h-20 sm:h-15" />

         {/* MAIN CONTENT */}
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
             
             {/* LEFT SECTION */}
             <div className="lg:col-span-2">
               <Link href="/product-catalog-sale" className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-(--color-primary) hover:text-(--color-olive) transition-colors">
                 <div className="w-6 h-6 sm:w-7 sm:h-7 bg-(--color-primary) rounded-full flex items-center justify-center">
                   <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </div>
                 <span className="text-xs sm:text-sm font-medium">Back to Products</span>
               </Link>

               {/* Product Images Carousel */}
               <div className="relative mb-6 sm:mb-8">
                 <div className="h-64 sm:h-80 md:h-96 lg:h-120 w-full max-w-lg mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100">
                   <Image 
                     src={currentProduct.images[currentImageIndex]} 
                     alt={currentProduct.title}
                     width={500}
                     height={600}
                     className="w-full h-full object-cover"
                   />
                 </div>
                
                <div className="flex justify-center mt-4 gap-2">
                  {currentProduct.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-(--color-olive) scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                                 <button onClick={prevImage} className="absolute border-1 border-(--color-primary) cursor-pointer left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-all duration-300">
                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-(--color-primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </button>
                 <button onClick={nextImage} className="absolute border-1 border-(--color-primary) cursor-pointer right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-all duration-300">
                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-(--color-primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </button>
               </div>

               {/* Product Title & Price */}
               <div className="mb-4 sm:mb-6">
                 <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{currentProduct.title}</h1>
                 <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-(--color-olive) mb-2 sm:mb-3">₱ {currentProduct.price.toLocaleString()}</div>
                 <div className="flex items-center gap-2 text-gray-600">
                   <img src="/icon/locateIcon.png" alt="Location" className="w-3 h-3 sm:w-4 sm:h-4" />
                   <span className="text-sm sm:text-base">{currentProduct.location}</span>
                 </div>
               </div>

               {/* Product Details */}
               <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                 <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                   <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Condition</h3>
                   <p className="text-gray-700 text-sm sm:text-base">{currentProduct.condition}</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                   <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Material</h3>
                   <p className="text-gray-700 text-sm sm:text-base">{currentProduct.material}</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                   <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Age</h3>
                   <p className="text-gray-700 text-sm sm:text-base">{currentProduct.age}</p>
                 </div>
               </div>

               {/* Seller Information */}
               <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--color-olive) rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                       </svg>
                     </div>
                     <div>
                       <p className="font-semibold text-gray-900 text-sm sm:text-base">{currentProduct.seller}</p>
                       <p className="text-xs sm:text-sm text-gray-600">Verified Seller</p>
                     </div>
                   </div>
                   <button className="px-4 sm:px-6 py-2 bg-(--color-olive) text-white rounded-full text-xs sm:text-sm font-medium hover:bg-(--color-primary) transition-colors">
                     Chat Now
                   </button>
                 </div>
               </div>

               {/* Product Description */}
               <div className="mb-6 sm:mb-8">
                 <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Description</h3>
                 <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{currentProduct.description}</p>
               </div>

               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                 <button onClick={() => setIsLiked(!isLiked)} className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-full border-2 font-medium transition-all duration-300 text-sm sm:text-base ${
                   isLiked ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-(--color-olive) hover:text-(--color-olive)'
                 }`}>
                   <div className="flex items-center justify-center gap-2">
                     <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                     {isLiked ? 'Liked' : 'Like'}
                   </div>
                 </button>
                 <button className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base">
                   <div className="flex items-center justify-center gap-2">
                     <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                     Add to Cart
                   </div>
                 </button>
                 <button className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-(--color-olive) text-white rounded-full font-medium hover:bg-(--color-primary) transition-colors text-sm sm:text-base">
                   <div className="flex items-center justify-center gap-2">
                     <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                     </svg>
                     Buy Now
                   </div>
                 </button>
               </div>
            </div>

             {/* RIGHT SECTION - Related Products */}
             <div className="lg:col-span-1">
               <div className="sticky top-20 sm:top-24 mx-10">
                 <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Related Products</h3>
                 <div className="space-y-3 sm:space-y-4">
                   {relatedProducts.map((product) => (
                     <Link key={product.id} href={`/item-view-sale/${product.id}`} className="block bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                       <div className="aspect-square">
                         <Image src={product.image} alt={product.title} width={300} height={300} className="w-full h-full object-cover" />
                       </div>
                       <div className="p-3 sm:p-4">
                         <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{product.title}</h4>
                         <div className="text-base sm:text-lg font-semibold text-(--color-olive) mb-2">₱ {product.price.toLocaleString()}</div>
                         <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                           <img src="/icon/locateIcon.png" alt="Location" className="w-2 h-2 sm:w-3 sm:h-3" />
                           <span>{product.location}</span>
                         </div>
                       </div>
                     </Link>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        </div>

                 {/* SIMILAR PRODUCTS SECTION */}
         <div className="bg-gray-50 py-8 sm:py-12 lg:py-16">
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
             <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Similar Products</h2>
               <div className="relative">
                 <div 
                   ref={carouselRef}
                   onScroll={handleScroll}
                   className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 scrollbar-hide" 
                   id="product-carousel"
                 >
                   {featuredProducts.map((product, index) => (
                     <div 
                       key={product.id} 
                       className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 flex-shrink-0 w-56 sm:w-64 md:w-72"
                       style={{
                         animationDelay: `${index * 0.1}s`
                       }}
                     >
                       <div className="relative overflow-hidden">
                         <img 
                           src={product.image}
                           alt={product.name}
                           className="w-full h-48 sm:h-55 object-cover group-hover:scale-110 transition-transform duration-500"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                         <button 
                           onClick={() => wishlist.toggleWishlist(product)}
                           className={`absolute cursor-pointer top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white transform hover:scale-110 ${
                             wishlist.isInWishlist(product.id) ? 'bg-red-100' : 'bg-white/80'
                           }`}
                         >
                           <img 
                             src="/icon/heartIcon.png" 
                             alt="wishlist" 
                             className={`w-3 h-3 sm:w-4 sm:h-4 ${wishlist.isInWishlist(product.id) ? 'filter brightness-0 saturate-100 invert-[0.2] sepia-[1] saturate-[5] hue-rotate-[340deg]' : ''}`}
                           />
                         </button>
                       </div>
                       <div className="p-3 sm:p-4">
                         <h3 className="font-semibold text-(--color-olive) text-sm sm:text-md mb-2 line-clamp-2">{product.name}</h3>
                         <p className="text-(--color-primary) font-bold text-sm sm:text-base mb-2">{product.price}</p>
                         <div className="flex items-center justify-between">
                           <div className="flex items-center text-gray-600 text-xs">
                             <img src="/icon/locateIcon.png" alt="location" className="w-2 h-2 sm:w-3 sm:h-4 mr-1 sm:mr-2" />
                             {product.location}
                           </div>
                           <button 
                             onClick={() => cart.addToCart(product)}
                             className="p-1.5 sm:p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 transform hover:scale-110"
                           >
                             <img src="/icon/addtocart.png" alt="add to cart" className="w-auto h-5 sm:h-7" />
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
                 
                 {/* Navigation buttons */}
                 {canScrollLeft && (
                   <button 
                     onClick={scrollLeft}
                     className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
                   >
                     <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                     </svg>
                   </button>
                 )}
                 
                 {canScrollRight && (
                   <button 
                     onClick={scrollRight}
                     className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
                   >
                     <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                   </button>
                 )}
               </div>

           </div>
         </div>

        {/* FOOTER */}
        <Footer />
      </main>
    </>
  );
}
