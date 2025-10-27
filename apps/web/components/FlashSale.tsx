"use client";
import { useState, useEffect } from 'react';
import { useContent } from '../hooks/useContent';

export default function FlashSale() {
  const { flashSaleSettings, isLoading } = useContent();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate time left based on flash sale settings
  useEffect(() => {
    if (!flashSaleSettings || !flashSaleSettings.isActive || !flashSaleSettings.endDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(flashSaleSettings.endDate).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSaleSettings]);

  // Don't render if no active flash sale or still loading
  if (isLoading || !flashSaleSettings || !flashSaleSettings.isActive) {
    return null;
  }

  return (
    <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-16 ">
      <div className="container mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center shadow-xl relative overflow-hidden max-w-6xl mx-auto">
          {/* Percentage Badge - Top Left */}
          <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-(--color-olive) text-white w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transform rotate-12 shadow-lg z-10">
            <span className="text-xl sm:text-2xl lg:text-4xl font-bold">{flashSaleSettings.discountPercentage}%</span>
          </div>
          
          {/* Featured Product Image - Left Side */}
          <div className="flex-shrink-0 mb-6 lg:mb-0 lg:mr-8 xl:mr-12 w-full lg:w-auto">
            <div className="w-full sm:w-80 h-48 sm:h-56 lg:h-64 bg-gray-100 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden">
              {flashSaleSettings.featuredProducts && flashSaleSettings.featuredProducts.length > 0 ? (
                <img 
                  src={flashSaleSettings.featuredProducts[0].images[0]} 
                  alt={flashSaleSettings.featuredProducts[0].title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src="/bedroom.png" 
                  alt="Flash Sale Item" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          
          {/* Content - Center */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-(--color-olive) mb-3 sm:mb-4 tracking-tight">
              {flashSaleSettings.title || 'FLASH SALE'}
            </h1>
            <p className="text-gray-800 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 font-medium">
              {flashSaleSettings.description || `Get up to ${flashSaleSettings.discountPercentage}% Off For All Items!`}
            </p>
            
            {/* Countdown Timer */}
            <div className="flex justify-center lg:justify-start space-x-1 sm:space-x-2">
              <div className="bg-(--color-olive) text-white px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] lg:min-w-[70px]">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
              </div>
              <div className="flex items-center text-green-800 text-lg sm:text-xl lg:text-2xl font-bold px-1 sm:px-2">:</div>
              <div className="bg-(--color-olive) text-white px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] lg:min-w-[70px]">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              </div>
              <div className="flex items-center text-green-800 text-lg sm:text-xl lg:text-2xl font-bold px-1 sm:px-2">:</div>
              <div className="bg-(--color-olive) text-white px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] lg:min-w-[70px]">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              </div>
              <div className="flex items-center text-green-800 text-lg sm:text-xl lg:text-2xl font-bold px-1 sm:px-2">:</div>
              <div className="bg-(--color-olive) text-white px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] lg:min-w-[70px]">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              </div>
            </div>
          </div>
          
          {/* Price Tag - Bottom Right */}
          <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 transform rotate-12">
            <div className="bg-(--color-olive) text-white p-2 sm:p-3 rounded-lg shadow-lg relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-(--color-olive) rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
              </div>
              {/* Tag hole */}
              <div className="absolute -top-1 left-2 sm:left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-900 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}