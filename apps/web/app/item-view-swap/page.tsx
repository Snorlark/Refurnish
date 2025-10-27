"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSearchParams, useRouter } from 'next/navigation';
import ChatBubble from '../../components/ChatBubble';
import { useCartContext } from '../../contexts/CartContext';
import { useSwap } from '../../hooks/useSwap';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlistContext } from '../../contexts/WishlistContext';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type BackendProduct = {
  _id: string;
  title: string;
  description: string;
  price?: number;
  condition: string;
  category: string;
  images: string[];
  location: string;
  status: string;
  material: string;
  age: { value: number; unit: string };
  listedAs: string;
  swapWantedDescription?: string;
  owner?: { 
    _id: string;
    email: string; 
    firstName: string; 
    lastName: string; 
  };
};

type SwapProduct = {
  id: string;
  title: string;
  image: string;
  location: string;
  wantItem: string;
  seller: string;
  condition: string;
  material: string;
  age: string;
  description: string;
  images: string[];
  owner?: { 
    _id: string;
    email: string; 
    firstName: string; 
    lastName: string; 
  };
};

type SaleProduct = {
  id: string;
  title: string;
  image: string;
  location: string;
  price: number;
};

const fallbackSwapProduct: SwapProduct = {
  id: "1",
  title: "360° Swivel Wooden Office Chair",
  image: "/products/chair/view1.jpg",
  location: "Manila",
  wantItem: "Small table",
  seller: "Ne-Yo Mad",
  condition: "Very Good - Light cushion wear",
  material: "Oak Wood, Chrome Metal, Thin Fabric Cushion",
  age: "9 years",
  description: "This is a solid oak wood office chair with a chrome metal base. Features 360° swivel functionality and rolling wheels for easy movement. The chair has a thin fabric cushion that shows light wear but is still comfortable. I'm looking to swap this because I switched to a standing desk setup.",
  images: ["/products/chair/view1.jpg", "/products/chair/view2.jpg", "/products/chair/view4.jpg"]
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export default function ItemViewSwapPage() {
  const cart = useCartContext();
  const wishlist = useWishlistContext();
  const { createSwap } = useSwap();
  const { isAuthenticated } = useAuth();
  const navbarRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const [currentSwapProduct, setCurrentSwapProduct] = useState<SwapProduct>(fallbackSwapProduct);
  const [relatedSaleProducts, setRelatedSaleProducts] = useState<SaleProduct[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load product and related products
  useEffect(() => {
    const id = searchParams.get('id') || '';
    if (!id) return;
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { signal: controller.signal });
        const p: BackendProduct = await res.json();
        if (!res.ok || !p) return;
        
        const swapProduct: SwapProduct = {
          id: p._id,
          title: p.title,
          image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/products/chair/view1.jpg',
          location: p.location || 'Metro Manila',
          wantItem: p.swapWantedDescription || 'Something interesting',
          seller: p.owner ? [p.owner.firstName, p.owner.lastName].filter(Boolean).join(' ') || 'Seller' : 'Seller',
          condition: p.condition,
          material: p.material,
          age: p.age ? `${p.age.value} ${p.age.unit}` : '—',
          description: p.description,
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [Array.isArray(p.images) ? (p.images[0] || '/products/chair/view1.jpg') : '/products/chair/view1.jpg'],
          owner: p.owner
        };
        setCurrentSwapProduct(swapProduct);

        // Fetch related sale products (same category, status listed, listedAs sale)
        const relatedRes = await fetch(`${API_BASE_URL}/api/products?status=listed&listedAs=sale&category=${encodeURIComponent(p.category)}`, { signal: controller.signal });
        const relatedData: BackendProduct[] = await relatedRes.json();
        const related = (relatedData || []).slice(0, 2).map(x => ({
          id: x._id,
          title: x.title,
          image: Array.isArray(x.images) && x.images[0] ? x.images[0] : '/living.png',
          location: x.location || 'Metro Manila',
          price: typeof x.price === 'number' ? x.price : 0,
        }));
        setRelatedSaleProducts(related);
      } catch {
        // ignore
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [searchParams]);

  useEffect(() => {
    if (!navbarRef.current) return;
    const navEl = navbarRef.current;
    const ctx = gsap.context(() => {
      gsap.timeline({
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
      prev === currentSwapProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentSwapProduct.images.length - 1 : prev - 1
    );
  };

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
                <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:text-(--color-olive) relative">
                  <img src="/icon/heartIcon.png" alt="Wishlist" className="h-4 w-auto" />
                  {wishlist.wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlist.wishlistCount}
                    </span>
                  )}
                </button>
                <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-(--color-olive) relative">
                  <img src="/icon/cartIcon.png" alt="Cart" className="h-4 w-auto" />
                  {cart.cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cart.cartCount}
                    </span>
                  )}
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
              <Link href="/product-catalog-swap" className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-(--color-primary) hover:text-(--color-olive) transition-colors">
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
                    src={currentSwapProduct.images[currentImageIndex]} 
                    alt={currentSwapProduct.title}
                    width={500}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex justify-center mt-4 gap-2">
                  {currentSwapProduct.images.map((_, index) => (
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
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={nextImage} className="absolute border-1 border-(--color-primary) cursor-pointer right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Product Title & Swap Info */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{currentSwapProduct.title}</h1>
                
                {/* Swap Want Item - Prominently Displayed */}
                <div className="bg-(--color-white) text-(--color-olive) rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="font-semibold text-sm sm:text-base lg:text-lg">Want: {currentSwapProduct.wantItem}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-3 sm:mb-4">
                  <img src="/icon/locateIcon.png" alt="Location" className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">{currentSwapProduct.location}</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Condition</h3>
                  <p className="text-gray-700 text-sm sm:text-base">{currentSwapProduct.condition}</p>
                </div>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Material</h3>
                  <p className="text-gray-700 text-sm sm:text-base">{currentSwapProduct.material}</p>
                </div>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Age</h3>
                  <p className="text-gray-700 text-sm sm:text-base">{currentSwapProduct.age}</p>
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
                      <Link 
                        href={`/user-profile/${currentSwapProduct.owner?.email || 'unknown'}`}
                        className="font-semibold text-gray-900 text-sm sm:text-base hover:text-green-600 transition-colors cursor-pointer"
                      >
                        {currentSwapProduct.seller}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-600">Verified Seller</p>
                    </div>
                  </div>
                  <button className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors">
                    Chat Now
                  </button>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-6 sm:mb-8">
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Description</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{currentSwapProduct.description}</p>
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
                <button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      setToast({ type: 'error', message: 'Please login to initiate a swap' });
                      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                      toastTimerRef.current = setTimeout(() => setToast(null), 1800);
                      return;
                    }
                    try {
                      await createSwap(currentSwapProduct.id, `Interested to swap for: ${currentSwapProduct.wantItem}`);
                      setToast({ type: 'success', message: 'A message was sent to the seller' });
                      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                      toastTimerRef.current = setTimeout(() => {
                        setToast(null);
                        window.location.href = '/cart-details/swap';
                      }, 1200);
                    } catch (e) {
                      setToast({ type: 'error', message: 'Failed to create swap. Please try again.' });
                      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                      toastTimerRef.current = setTimeout(() => setToast(null), 1800);
                    }
                  }}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-(--color-olive) text-white rounded-full font-medium hover:bg-(--color-primary) transition-colors text-sm sm:text-base"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Swap
                  </div>
                </button>
              </div>
            </div>

            {/* RIGHT SECTION - Related Sale Products */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 sm:top-24 mx-10">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Related Products</h3>
                <div className="space-y-3 sm:space-y-4">
                  {relatedSaleProducts.map((product) => (
                    <Link key={product.id} href={`/item-view-sale?id=${product.id}`} className="block bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <div className="aspect-square">
                        <Image src={product.image} alt={product.title} width={300} height={300} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-(--color-olive) mb-1">{product.title}</h4>
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

        {/* FOOTER */}
        <div className="border-t-[0.2px] border-(--color-olive) mt-12 text-center"></div>

        <footer className="bg-(--color-white) text-(--color-primary) py-16 px-6 lg:px-16">
          <div className="max-w-7xl px-6 lg:px-9 py-4 container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div>
                <img src="/refurnishlogoSection.png" alt="Logo" className="w-60 pb-2 h-auto object-center" />
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

              <div>
                <h4 className="text-md font-semibold mb-4">Information</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Privacy</a></li>
                  <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">Terms of Use</a></li>
                  <li><a href="#" className="hover:text-(--color-olive) transition-modern text-sm">About Us</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-4">Contact Us</h4>
                <ul className="space-y-3 text-sm">
                  <li>Email: support@refurnish.ph</li>
                  <li>Mobile/Viber: +63 912 345 6789</li>
                  <li>Messenger: m.me/refurnishph</li>
                </ul>
              </div>

              <div>
                <p className="text-bottom text-sm">© 2025 NOVU. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
      {/* Themed Toast Notification */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`min-w-[260px] max-w-sm px-4 py-3 rounded-xl shadow-xl ring-1 ring-black/10 bg-white flex items-start gap-3 border-l-4 ${toast.type === 'success' ? 'border-l-(--color-olive)' : 'border-l-red-500'}`}>
            <div className={`mt-0.5 rounded-full p-1 ${toast.type === 'success' ? 'bg-(--color-olive)/10 text-(--color-olive)' : 'bg-red-100 text-red-600'}`}>
              {toast.type === 'success' ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.5 12.086l6.793-6.793a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0 1 1 0 01-2 0zm.293-7.707a1 1 0 011.414 0l.007.007a1 1 0 01.286.704l-.2 5a1 1 0 11-1.998-.08l.2-5a1 1 0 01.291-.631z" clipRule="evenodd"/></svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-(--color-olive)' : 'text-red-700)'}`.replace(')', '')}>{toast.type === 'success' ? 'Success' : 'Notice'}</p>
              <p className="text-sm text-neutral-700 mt-0.5">{toast.message}</p>
            </div>
            <button
              aria-label="Dismiss"
              onClick={() => setToast(null)}
              className="ml-2 text-neutral-400 hover:text-neutral-600"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Chat Bubble */}
      <ChatBubble 
        sellerId={currentSwapProduct.owner?._id}
        sellerName={currentSwapProduct.seller}
        openWithUser={currentSwapProduct.owner ? {
          id: currentSwapProduct.owner._id,
          email: currentSwapProduct.owner.email,
          firstName: currentSwapProduct.owner.firstName,
          lastName: currentSwapProduct.owner.lastName
        } : undefined}
      />
    </>
  );
}
