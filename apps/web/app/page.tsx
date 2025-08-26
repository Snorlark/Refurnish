/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would validate credentials against your backend
      // For now, we'll simulate a successful login
      console.log('Login attempt:', { email, password });
      
      // Redirect to dashboard - in Next.js you'd use router.push('/dashboard')
      // For this demo, we'll show an alert
      alert('Login successful! Redirecting to dashboard...');
      
      // In a real Next.js app:
      // import { useRouter } from 'next/navigation';
      // const router = useRouter();
      // router.push('/dashboard');
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    // Navigate to register page
    console.log('Navigate to register page');
    alert('Navigate to register page');
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    console.log('Navigate to forgot password page');
    alert('Navigate to forgot password page');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fondest:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Fondest', sans-serif;
        }
      `}</style>
      
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url("/images/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background Overlay for better text readability
        <div className="absolute inset-0 bg-black bg-opacity-30" /> */}

        <div className="relative w-full max-w-md">
          {/* Logo and Tagline */}
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="mb-4">
              <img 
                src="/Rf-long-logo.svg" 
                alt="REFURNISH" 
                className="h-20 mx-auto"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                }}
              />
              {/* Fallback text logo */}
              <h1 
                className="text-4xl font-bold text-white tracking-wider hidden"
                style={{ letterSpacing: '0.2em' }}
              >
                REFURNISH
              </h1>
            </div>
            
            {/* Tagline */}
            <p className="text-gray-300 text-lg font-semibold">
              From their home to yours.
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-gray-100 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
              Log In
            </h2>

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Show
                      </>
                    )}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                
                {/* Forgot Password Link */}
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Forget your password
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Doesnt have an account yet?{' '}
                <button
                  onClick={handleRegisterClick}
                  className="text-gray-800 font-semibold underline hover:text-gray-900"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;