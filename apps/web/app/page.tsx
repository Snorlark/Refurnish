import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-white font-['Futura']">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-modern fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/icon/RF.png" alt="Logo" className="h-5 w-auto object-cover" />            
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex space-x-10 text-sm font-medium text-gray-700">
              <Link href="/" className="hover:text-green-900 transition-modern">Home</Link>
              <Link href="/shop" className="hover:text-green-900 transition-modern">Shop</Link>
              <Link href="/about" className="hover:text-green-900 transition-modern">About</Link>
              <Link href="/contact" className="hover:text-green-900 transition-modern">Contact</Link>
            </div>

            {/* Right Icons */}
            <div className="hidden md:flex items-center space-x-8 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
                <img src="/icon/userIcon.png" alt="Logo" className="h-5 w-auto object-cover" />            
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
              <img src="/icon/searchIcon.png" alt="Logo" className="h-5 w-auto object-cover" />            
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
                <img src="/icon/heartIcon.png" alt="Logo" className="h-5 w-auto object-cover" />            
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-modern cursor-pointer">
                <img src="/icon/cartIcon.png" alt="Logo" className="h-5 w-auto object-cover" />            
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen bg-cover bg-center" style={{backgroundImage: 'url(/bg-heropage.png)'}}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 h-full flex items-center justify-end pr-8 md:pr-20 lg:pr-32">
          <div className="bg-white/98 backdrop-blur-sm p-10 radius-20 shadow-modern max-w-lg">
            <p className="text-[16px] uppercase tracking-[0.2em] text-gray-500 mb-3 font-medium">Welcome Offer</p>
            <h1 className="text-[50px] md:text-5xl font-bold text-(--color-olive) mb-6 leading-tight tracking-tight">
              Save $10 on your first order!
            </h1>
            <p className="text-gray-700 mb-8 leading-relaxed text-[18px]">
              Enjoy a 10% discount on your first two furniture purchases when you sign up today.
            </p>
            <button className="bg-(--color-olive) text-white px-10 py-4 radius-full font-semibold hover:bg-green-800 transition-modern text-[16px]">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Affordable Style Section */}
      <div className="py-24 px-6 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl md:text-[32px] font-bold text-green-900 mb-8 leading-tight tracking-tight">
            Affordable Style, Sustainable Choice.
          </h2>
          <p className="text-[16px] text-gray-700 max-w-4xl mx-auto mb-16 leading-relaxed">
            Elevate your home's look without breaking the bank. Our pre-loved furniture offers a unique, affordable, and eco-friendly way to shop for your space.
          </p>
          
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
              <img src="/living.png" alt="Living" className="w-full h-80 object-cover group-hover:scale-105 transition-modern" />
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">Living</h3>
              </div>
            </div>
            <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
              <img src="/dining.png" alt="Dining" className="w-full h-80 object-cover group-hover:scale-105 transition-modern" />
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">Dining</h3>
              </div>
            </div>
            <div className="bg-white radius-20 shadow-modern overflow-hidden hover:shadow-modern-hover transition-modern group">
              <img src="/bedroom.png" alt="Bedroom" className="w-full h-80 object-cover group-hover:scale-105 transition-modern" />
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">Bedroom</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Products Section */}
      <div className="py-24 px-6 lg:px-16 bg-gray-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-green-900 mb-8 leading-tight tracking-tight">
              Our Products
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {/* Product Cards - Reusing images for now */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item, index) => (
              <div key={index} className="bg-white radius-20 shadow-modern hover:shadow-modern-hover transition-modern overflow-hidden group">
                <div className="relative">
                  <img 
                    src={index % 3 === 0 ? "/living.png" : index % 3 === 1 ? "/dining.png" : "/bedroom.png"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-modern"
                  />
                  {index === 2 && (
                    <div className="absolute top-4 left-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-modern">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-base">
                    {index === 0 ? "Filing Cab on Wheels" : 
                     index === 1 ? "Bent Ply Office Chair" : 
                     index === 2 ? "Muji Style Low Chair" : 
                     index === 3 ? "12-Layered Oak Dra..." : 
                     `Product ${index + 1}`}
                  </h3>
                  <p className="text-green-900 font-bold text-xl mb-4">₱ 12,000.00</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 text-sm">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Amanpulo
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-modern">
                        <span className="text-xs font-bold text-gray-600">W</span>
                      </button>
                      <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-modern">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explore More Button */}
          <div className="text-center">
            <button className="bg-green-100 text-green-900 border-2 border-green-900 px-12 py-4 radius-10 font-semibold hover:bg-green-200 transition-modern text-lg">
              Explore More
            </button>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="py-24 px-6 lg:px-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Nationwide Delivery */}
            <div className="text-center lg:text-left">
              <div className="bg-white radius-20 shadow-modern overflow-hidden mb-8 group">
                <img src="/living.png" alt="Delivery" className="w-full h-64 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <h3 className="text-3xl font-bold text-green-900 mb-6 leading-tight">Nationwide Delivery Assistance</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Get connected with trusted couriers across the Philippines, giving you options for the most convenient and affordable delivery service for your location.
              </p>
            </div>

            {/* Curated Quality */}
            <div className="text-center lg:text-left">
              <div className="bg-white radius-20 shadow-modern overflow-hidden mb-8 group">
                <img src="/dining.png" alt="Quality" className="w-full h-64 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <h3 className="text-3xl font-bold text-green-900 mb-6 leading-tight">Curated Quality Finds</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Every piece listed on our platform is reviewed to ensure accurate descriptions, clear photos, and honest condition ratings.
              </p>
            </div>

            {/* Budget Friendly */}
            <div className="text-center lg:text-left">
              <div className="bg-white radius-20 shadow-modern overflow-hidden mb-8 group">
                <img src="/bedroom.png" alt="Budget" className="w-full h-64 object-cover group-hover:scale-105 transition-modern" />
              </div>
              <h3 className="text-3xl font-bold text-green-900 mb-6 leading-tight">Budget-Friendly Furniture</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Discover pre-loved and unused furniture at prices that fit your budget, without compromising on style or quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REFURNISH Section */}
      <div className="relative py-24 px-6 lg:px-16" style={{backgroundImage: 'url(/bg-heropage.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">REFURNISH</h2>
          <p className="text-2xl text-white mb-12 font-medium">From their home to yours.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="bg-green-100 text-green-900 border-2 border-green-900 px-12 py-4 radius-10 font-semibold hover:bg-green-200 transition-modern text-lg">
              Buy Now
            </button>
            <p className="text-white text-lg">
              Ready to start selling? <span className="underline cursor-pointer hover:text-green-200 transition-modern">Learn more &gt;</span>
            </p>
          </div>
        </div>
      </div>

      {/* Giving Furniture Section */}
      <div className="py-24 px-6 lg:px-16 bg-gray-50/50">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-green-900 mb-8 leading-tight tracking-tight">
            Giving Furniture a Second Home
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
            This is the place where pre-loved furniture finds a new home. Whether you're buying, selling, or simply browse, we make it easy, sustainable, and stylish.
          </p>
          <button className="bg-green-900 text-white px-12 py-4 radius-10 font-semibold hover:bg-green-800 transition-modern text-lg">
            Sign Up Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 lg:px-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Logo and Social */}
            <div>
              <h3 className="text-3xl font-bold text-green-400 mb-6 tracking-tight">REFURNISH</h3>
              <div className="flex space-x-6">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-400 hover:text-gray-900 transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-400 hover:text-gray-900 transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-400 hover:text-gray-900 transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-400 hover:text-gray-900 transition-modern cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Information</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-green-400 transition-modern text-lg">Privacy</a></li>
                <li><a href="#" className="hover:text-green-400 transition-modern text-lg">Terms of Use</a></li>
                <li><a href="#" className="hover:text-green-400 transition-modern text-lg">About Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-lg">
                <li>Email: info@refurnish.com</li>
                <li>Mobile/Viber: +63 912 345 6789</li>
                <li>Messenger: @refurnish</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-lg">© 2023. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
