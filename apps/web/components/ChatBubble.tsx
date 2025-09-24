"use client";
import { useState } from 'react';

interface ChatBubbleProps {
  className?: string;
}

export default function ChatBubble({ className = "" }: ChatBubbleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className={`fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 ${className}`}>
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-12 h-12  cursor-pointer md:w-14 md:h-14 bg-(--color-olive) rounded-full flex items-center justify-center text-white shadow-lg hover:bg-(--color-primary) transition-all duration-300 hover:scale-110"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      
      {isChatOpen && (
        <div className="absolute bottom-14 md:bottom-16 right-0 w-72 md:w-80 h-80 md:h-96 bg-white  rounded-lg shadow-xl border flex flex-col">
          <div className="flex items-center justify-between p-3 md:p-4 border-b">
            <h3 className="font-semibold text-black text-sm md:text-base">Chat with Seller</h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-1 cursor-pointer  hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-3 md:p-4 overflow-y-auto">
            <div className="text-center text-gray-500 text-xs md:text-sm">
              Start a conversation with the seller
            </div>
          </div>
          
          <div className="p-3 md:p-4 border-t">
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Type a message..."
                className="flex-1 px-2 md:px-3 py-2 border rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
              <button className="bg-(--color-olive) cursor-pointer  text-white px-3 md:px-4 py-2 rounded-lg hover:bg-(--color-primary) transition-colors">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}