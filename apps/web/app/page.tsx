/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();
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
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
      
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
        @import url('https://fonts.googleapis.com/css2?family=Fustat:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Fustat', sans-serif;
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
              {/* Tagline */}
              <p className="text-white text-lg font-semibold mt-0.5">
                From their home to yours.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-gray-100 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#273815] text-center mb-8">
              Log In
            </h2>

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#273815] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-[#273815]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center text-sm text-[#273815]"
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
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                
                {/* Forgot Password Link */}
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#273815] underline"
                  >
                    Forget your password
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
                className="w-full bg-[#636B2F] text-white font-semibold py-3 px-4 rounded-full shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-[#273815]">
                Doesnt have an account yet?{' '}
                <button
                  onClick={handleRegisterClick}
                  className="text-[#273815] font-semibold underline hover:text-gray-900"
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