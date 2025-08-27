"use client";
import { useState, useEffect } from 'react';

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 1,
    minutes: 52,
    seconds: 48
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-16 px-6 lg:px-16 bg-gray-50/50">
      <div className="container mx-auto">
        <div className="bg-white rounded-3xl p-8 flex items-center shadow-xl relative overflow-hidden max-w-6xl mx-auto">
          {/* Percentage Badge - Top Left */}
          <div className="absolute top-6 left-6 bg-green-800 text-white w-16 h-16 rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
            <span className="text-2xl font-bold">%</span>
          </div>
          
          {/* Chair Image - Left Side */}
          <div className="flex-shrink-0 mr-12">
            <div className="w-80 h-64 bg-gray-100 rounded-3xl flex items-center justify-center overflow-hidden">
              <img 
                src="/bedroom.png" 
                alt="Vintage Chair" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Content - Center */}
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-green-800 mb-4 tracking-tight">
              3 DAYS <span className="italic font-normal">FLASH</span> SALE
            </h1>
            <p className="text-gray-800 text-xl mb-8 font-medium">
              Get up to <span className="font-bold text-2xl text-black">70%</span> Off For All Vintage<br />
              Chairs Today!
            </p>
            
            {/* Countdown Timer */}
            <div className="flex space-x-2">
              <div className="bg-green-800 text-white px-4 py-3 rounded-lg text-center min-w-[70px]">
                <div className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
              </div>
              <div className="flex items-center text-green-800 text-2xl font-bold px-2">:</div>
              <div className="bg-green-800 text-white px-4 py-3 rounded-lg text-center min-w-[70px]">
                <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              </div>
              <div className="flex items-center text-green-800 text-2xl font-bold px-2">:</div>
              <div className="bg-green-800 text-white px-4 py-3 rounded-lg text-center min-w-[70px]">
                <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              </div>
              <div className="flex items-center text-green-800 text-2xl font-bold px-2">:</div>
              <div className="bg-green-800 text-white px-4 py-3 rounded-lg text-center min-w-[70px]">
                <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              </div>
            </div>
          </div>
          
          {/* Price Tag - Bottom Right */}
          <div className="absolute bottom-6 right-6 transform rotate-12">
            <div className="bg-green-800 text-white p-3 rounded-lg shadow-lg relative">
              <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
              </div>
              {/* Tag hole */}
              <div className="absolute -top-1 left-3 w-2 h-2 bg-green-900 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
