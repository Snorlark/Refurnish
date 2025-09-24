"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, ArrowLeft, RefreshCw } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fustat:wght@300;400;500;600;700&display=swap");
        * {
          font-family: "Fustat", sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#fffef3] via-[#e9efcf] to-[#dbe6ae] flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/60">
            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-[#273815] mb-4">
                Oops! Page Not Found
              </h1>
              <div className="w-24 h-1 bg-[#636B2F] mx-auto rounded-full"></div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <p className="text-lg text-gray-600 mb-2">
                The page you're looking for seems to have wandered off.
              </p>
              <p className="text-gray-500">
                Don't worry, even the best furniture sometimes needs to be relocated!
              </p>
            </div>

            {/* Illustration */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-gray-400" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 bg-[#636B2F] text-white font-semibold rounded-full hover:bg-[#4d5323] transition-all duration-200 hover:translate-y-1 hover:shadow-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-8 py-4 bg-white text-[#636B2F] font-semibold rounded-full border-2 border-[#636B2F] hover:bg-[#636B2F] hover:text-white transition-all duration-200 hover:translate-y-1 hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Still can't find what you're looking for?
              </p>
              <div className="space-y-2">
                <Link
                  href="/shop"
                  className="block text-[#636B2F] hover:text-[#4d5323] font-medium transition-colors"
                >
                  Browse our furniture collection
                </Link>
                <Link
                  href="/help"
                  className="block text-[#636B2F] hover:text-[#4d5323] font-medium transition-colors"
                >
                  Visit our help center
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-[#636B2F] rounded-full opacity-30"></div>
            <div className="w-2 h-2 bg-[#636B2F] rounded-full opacity-50"></div>
            <div className="w-2 h-2 bg-[#636B2F] rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
    </>
  );
}
