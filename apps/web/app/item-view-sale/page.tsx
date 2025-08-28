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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [similarProductsIndex, setSimilarProductsIndex] = useState(0);

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

  return (
    <>
      <main className="bg-white font-['Futura'] min-h-screen transition-all ease-in-out duration-300">
        {/* NAVBAR */}
        <nav
          ref={navbarRef}
          className="bg-white/95 backdrop-blur-md rounded-full mx-3 sm:mx-6 md:mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
          style={{ height: 72 }}
        >
          <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-9 h-full">
            <div className="flex justify-between items-center h-full gap-3">
              <Link href="/" className="nav-logo flex items-center flex-shrink-0">
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
        <div className="max-w-7xl mx-30 px-4 sm:px-6 lg:px-9 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT SECTION */}
            <div className="lg:col-span-2 ">
              <Link href="/product-catalog-sale" className="inline-flex items-center gap-2 mb-6 text-(--color-primary) hover:text-(--color-olive) transition-colors">
                <div className="w-7 h-7 bg-(--color-primary) rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Back to Products</span>
              </Link>

              {/* Product Images Carousel */}
              <div className="relative mb-8">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
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
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-(--color-olive) scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Product Title & Price */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProduct.title}</h1>
                <div className="text-2xl font-semibold text-(--color-olive) mb-3">₱ {currentProduct.price.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-gray-600">
                  <img src="/icon/locateIcon.png" alt="Location" className="w-4 h-auto" />
                  <span>{currentProduct.location}</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Condition</h3>
                  <p className="text-gray-700">{currentProduct.condition}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Material</h3>
                  <p className="text-gray-700">{currentProduct.material}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Age</h3>
                  <p className="text-gray-700">{currentProduct.age}</p>
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-gray-50 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-(--color-olive) rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{currentProduct.seller}</p>
                      <p className="text-sm text-gray-600">Verified Seller</p>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-(--color-olive) text-white rounded-full text-sm font-medium hover:bg-(--color-primary) transition-colors">
                    Chat Now
                  </button>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{currentProduct.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button onClick={() => setIsLiked(!isLiked)} className={`flex-1 py-3 px-6 rounded-full border-2 font-medium transition-all duration-300 ${
                  isLiked ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-(--color-olive) hover:text-(--color-olive)'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isLiked ? 'Liked' : 'Like'}
                  </div>
                </button>
                <button className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add to Cart
                  </div>
                </button>
                <button className="flex-1 py-3 px-6 bg-(--color-olive) text-white rounded-full font-medium hover:bg-(--color-primary) transition-colors">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Buy Now
                  </div>
                </button>
              </div>
            </div>

            {/* RIGHT SECTION - Related Products */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Products</h3>
                <div className="space-y-4">
                  {relatedProducts.map((product) => (
                    <Link key={product.id} href={`/item-view-sale/${product.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <div className="aspect-square">
                        <Image src={product.image} alt={product.title} width={300} height={300} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
                        <div className="text-lg font-semibold text-(--color-olive) mb-2">₱ {product.price.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <img src="/icon/locateIcon.png" alt="Location" className="w-3 h-auto" />
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
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-9">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
            
            <div className="relative">
              <div className="flex gap-6 overflow-hidden">
                {similarProducts.slice(similarProductsIndex, similarProductsIndex + 5).map((product) => (
                  <Link key={product.id} href={`/item-view-sale/${product.id}`} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    <div className="aspect-square">
                      <Image src={product.image} alt={product.title} width={256} height={256} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
                      <div className="text-lg font-semibold text-(--color-olive) mb-2">₱ {product.price.toLocaleString()}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <img src="/icon/locateIcon.png" alt="Location" className="w-3 h-auto" />
                          <span>{product.location}</span>
                        </div>
                        <button className="w-8 h-8 bg-(--color-olive) rounded-full flex items-center justify-center hover:bg-(--color-primary) transition-colors">
                        <img src="/icon/addtocart.png" alt="addtocart" className="w-auto h-8 cursor-pointer object-center transition-modern" />

                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <button onClick={prevSimilarProducts} className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={nextSimilarProducts} className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
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
                  <li>Email: info@refurnish.com</li>
                  <li>Mobile/Viber: +63 912 345 6789</li>
                  <li>Messenger: @refurnish</li>
                </ul>
              </div>

              <div>
                <p className="text-bottom text-sm">© 2025 NOVU. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
