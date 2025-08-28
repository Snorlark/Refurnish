"use client";
import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Google SSO Button */}
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            {/* Email Form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Enter your password"
                />
              </div>
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Confirm Password</label>
                  <input 
                    type="password" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    placeholder="Confirm your password"
                  />
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-green-900 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            
            <div className="text-center text-sm text-gray-600">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setAuthMode('signup')}
                    className="text-green-900 hover:text-green-800 font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="text-green-900 hover:text-green-800 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}