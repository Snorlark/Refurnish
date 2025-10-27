"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, XCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { signIn } from "next-auth/react";
import Link from "next/link";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, register, googleLogin, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  // Sign Up modal state
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; textColor: string; barColor: string }>({ score: 0, label: "", textColor: "", barColor: "" });

  // 2FA State
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpType, setOtpType] = useState<'registration' | 'login' | 'admin'>('login');
  const [isOTPLoading, setIsOTPLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [currentOTP, setCurrentOTP] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const evaluatePasswordStrength = (value: string) => {
    let score = 0;
    const lengthGood = value.length >= 8;
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    if (lengthGood) score += 1;
    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;

    let label = "Very weak";
    let textColor = "text-red-600";
    let barColor = "bg-red-500";
    if (score === 1) { label = "Weak"; textColor = "text-orange-600"; barColor = "bg-orange-500"; }
    if (score === 2) { label = "Fair"; textColor = "text-yellow-700"; barColor = "bg-yellow-500"; }
    if (score === 3) { label = "Good"; textColor = "text-green-700"; barColor = "bg-green-500"; }
    if (score >= 4) { label = "Strong"; textColor = "text-emerald-700"; barColor = "bg-emerald-500"; }

    return { score, label, textColor, barColor };
  };

  const handleLogin = async () => {
    setAlert(null);

    try {
      if (!email || !password) {
        setAlert({ type: "error", message: "Please enter both email and password." });
        return;
      }

      // Check for hardcoded admin credentials
      const isAdminCredential = email === "admin@refurnish.dev" && password === "Refurnish2024!@#Admin";
      
      // Check if user needs 2FA (admin always needs it, regular users if last login > 1 month)
      if (isAdminCredential) {
        setIsAdminLoading(true);
        setOtpType('admin');
        setShowOTPForm(true);
        
        try {
          await sendOTPCode(email, 'admin');
          // Automatically fetch the current OTP for admin in development
          if (process.env.NODE_ENV === 'development') {
            setTimeout(() => getCurrentOTP(), 1000);
          }
        } catch (error) {
          setShowOTPForm(false);
          throw error;
        } finally {
          setIsAdminLoading(false);
        }
        return;
      }

      // Check if regular user needs 2FA
      const needsOTP = await checkLastLogin(email);
      if (needsOTP) {
        setOtpType('login');
        await sendOTPCode(email, 'login');
        setShowOTPForm(true);
        return;
      }

      // Proceed with normal login
      await login(email, password);
      setAlert({ type: "success", message: "Login successful! Redirecting..." });
    } catch (error: any) {
      setAlert({ type: "error", message: error.message || "Login failed. Please try again." });
    }
  };

  const handleRegisterClick = () => setIsSignUpOpen(true);
  const closeSignUp = () => setIsSignUpOpen(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSignUpOpen(false);
    };
    if (isSignUpOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSignUpOpen]);

  const handleSignUp = async () => {
    setAlert(null);

    try {
      if (!firstName || !lastName || !signUpEmail || !signUpPassword || !confirmPassword) {
        setAlert({ type: "error", message: "Please fill in all fields." });
        return;
      }
      if (signUpPassword !== confirmPassword) {
        setAlert({ type: "error", message: "Passwords do not match." });
        return;
      }

      // Register user first
      await register(firstName, lastName, signUpEmail, signUpPassword);
      
      // Send OTP for email verification
      setEmail(signUpEmail);
      setOtpType('registration');
      await sendOTPCode(signUpEmail, 'registration');
      setShowOTPForm(true);
      setIsSignUpOpen(false);
    } catch (error: any) {
      setAlert({ type: "error", message: error.message || "Registration failed. Please try again." });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAlert(null);
      console.log('Starting Google OAuth...');
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/shop'
      });
      
      console.log('Google OAuth result:', result);
      
      if (result?.error) {
        console.error('Google OAuth error:', result.error);
        setAlert({ type: "error", message: "Google login failed. Please try again." });
      } else if (result?.ok) {
        console.log('Google OAuth successful');
        setAlert({ type: "success", message: "Google login successful! Redirecting..." });
        // Don't redirect immediately, let the AuthContext handle it
        setTimeout(() => {
          router.push('/shop');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Google OAuth exception:', error);
      setAlert({ type: "error", message: error.message || "Google login failed." });
    }
  };

  const handleForgotPassword = () => {
    setAlert({ type: "info" as any, message: "Password reset feature coming soon." });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  // 2FA Functions
  const sendOTPCode = async (email: string, type: 'registration' | 'login' | 'admin') => {
    try {
      setIsOTPLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setOtpExpired(false);
      setOtpTimer(600); // 10 minutes = 600 seconds
      setOtp(''); // Clear the OTP field when sending new OTP
      setAlert({ type: "success", message: `Verification code sent to ${type === 'admin' ? 'admin email' : email}` });
    } catch (error: any) {
      setAlert({ type: "error", message: error.message || "Failed to send verification code" });
    } finally {
      setIsOTPLoading(false);
    }
  };

  const verifyOTPCode = async () => {
    try {
      if (!otp || otp.length !== 6) {
        setAlert({ type: "error", message: "Please enter a valid 6-digit code" });
        return;
      }

      setIsOTPLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: otpType })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid verification code');
      }

      // OTP verified successfully, proceed with login
      if (otpType === 'admin') {
        await login(email, password, "REFURNISH_ADMIN_SECRET_2024");
      } else {
        await login(email, password);
      }
      
      setAlert({ type: "success", message: "Login successful! Redirecting..." });
      setShowOTPForm(false);
    } catch (error: any) {
      setAlert({ type: "error", message: error.message || "Verification failed" });
    } finally {
      setIsOTPLoading(false);
    }
  };

  const checkLastLogin = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com'}/api/users/check-last-login/${email}`);
      if (response.ok) {
        const data = await response.json();
        return data.needsOTP;
      }
      return false;
    } catch (error) {
      console.error('Error checking last login:', error);
      return false;
    }
  };

  const handleBackToLanding = () => {
    router.push('/landing');
  };

  // Function to get current OTP for testing
  const getCurrentOTP = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/current-otp/${email}?type=${otpType}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentOTP(data.otp || '');
      }
    } catch (error) {
      console.error('Error fetching current OTP:', error);
    }
  };

  // OTP Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

   const AlertWidget = () =>
    alert ? (
      <div
        className={`flex items-center justify-between p-3 rounded-lg shadow-md mb-4 ${
          alert.type === "error"
            ? "bg-red-100 border border-red-300 text-red-700"
            : alert.type === "success"
            ? "bg-green-100 border border-green-300 text-green-700"
            : "bg-yellow-100 border border-yellow-300 text-yellow-700"
        }`}
      >
        <div className="flex items-center space-x-2">
          {alert.type === "error" && <XCircle className="w-5 h-5" />}
          {alert.type === "success" && <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
        <button onClick={() => setAlert(null)} className="text-sm font-bold">
          ×
        </button>
      </div>
    ) : null;


  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fustat:wght@300;400;500;600;700&display=swap");
        * {
          font-family: "Fustat", sans-serif;
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url("/login-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative w-full max-w-sm">
          {/* Back Button */}
          <button
            onClick={handleBackToLanding}
            className="absolute -top-16 left-0 flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back to Landing</span>
          </button>

          {/* Logo and Tagline */}
          <div className="text-center mb-5">
            <div className="mb-3">
              <img
                src="/Rf-long-logo.svg"
                alt="REFURNISH"
                className="h-16 mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display =
                    "block";
                }}
              />
              <h1
                className="text-2xl font-bold text-white tracking-wider hidden"
                style={{ letterSpacing: "0.15em" }}
              >
                REFURNISH
              </h1>
              <p className="text-white text-base font-medium mt-0.5">
                From their home to yours.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-gray-100 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-extrabold text-[#273815] text-center mb-6">
              Log In
            </h2>
            <div className="space-y-4  ">
              <button 
                onClick={handleGoogleLogin}
                className="w-full cursor-pointer flex text-base items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black"
              >
                <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
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
                <span className="px-2 bg-gray-100 text-gray-500">Or</span>
              </div>
            </div>

                <AlertWidget/>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#273815] mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 bg-white text-sm border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F] transition-all"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-[#273815]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center text-xs text-[#273815]"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 mr-1" />
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
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F] transition-all"
                  placeholder="Enter your password"
                />

                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#273815] underline"
                  >
                    Forget your password
                  </button>
                </div>
              </div>


              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading || isAdminLoading || !email || !password}
                className="w-full bg-[#636B2F] text-white font-semibold py-2.5 px-3 rounded-full shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : isAdminLoading ? "Sending verification code..." : "Log In"}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-[#273815]">
                Don’t have an account yet?{" "}
                <button
                  onClick={handleRegisterClick}
                  className="text-[#273815] cursor-pointer font-semibold underline hover:text-gray-900"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Form */}
      {showOTPForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-extrabold text-[#273815] text-center mb-6">
              {otpType === 'registration' ? 'Verify Your Email' : 'Two-Factor Authentication'}
            </h2>
            
            {/* Loading state while sending OTP */}
            {isAdminLoading && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sending verification code...
                </div>
              </div>
            )}
            
            {!isAdminLoading && (
              <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  {otpType === 'registration' 
                    ? 'We sent a verification code to your email address. Please enter it below to complete your registration.'
                    : otpType === 'admin'
                    ? 'Admin login requires verification. We sent a code to the admin email address.'
                    : 'For security purposes, please enter the verification code sent to your email address.'
                  }
                </p>
                {otpType !== 'admin' && (
                  <p className="text-sm font-medium text-[#273815]">{email}</p>
                )}
              </div>

              {/* Timer Display */}
              {otpTimer > 0 && (
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    otpTimer <= 60 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Code expires in {formatTimer(otpTimer)}
                  </div>
                </div>
              )}

              {/* DEBUG: Show current OTP for testing */}
              {process.env.NODE_ENV === 'development' && otpType === 'admin' && currentOTP && (
                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Current OTP: {currentOTP}
                  </div>
                </div>
              )}

              {otpExpired && (
                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Code expired
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-xs font-medium text-[#273815] mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F] transition-all text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowOTPForm(false);
                    setOtp('');
                    setOtpSent(false);
                    setOtpTimer(0);
                    setOtpExpired(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyOTPCode}
                  disabled={isOTPLoading || !otp || otp.length !== 6 || otpExpired}
                  className="flex-1 px-4 py-2 bg-[#636B2F] text-white rounded-lg hover:bg-[#4a5a22] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOTPLoading ? 'Verifying...' : otpExpired ? 'Code Expired' : 'Verify'}
                </button>
              </div>

              {(otpExpired || otpTimer === 0) && (
                <div className="text-center">
                  <button
                    onClick={() => sendOTPCode(email, otpType)}
                    disabled={isOTPLoading}
                    className="text-sm text-[#636B2F] underline hover:text-[#4a5a22] disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {isSignUpOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeSignUp}
          />
          <div className="relative w-full max-w-lg bg-gray-100 rounded-2xl shadow-2xl z-10">
            <div className="p-6 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-extrabold text-[#273815] text-center w-full">
                  Sign Up
                </h2>
              </div>

                 <AlertWidget />
              <div className="space-y-4">
                {/* Google Sign Up Button */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full cursor-pointer flex text-base items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black"
                >
                  <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-100 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs font-medium text-[#273815] mb-1.5"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs font-medium text-[#273815] mb-1.5"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2  text-sm bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="signUpEmail"
                    className="block text-xs font-medium text-[#273815] mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="signUpEmail"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-3 py-2  text-sm bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="signUpPassword"
                      className="block text-xs font-medium text-[#273815]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="flex items-center text-xs text-[#273815]"
                    >
                      {showSignUpPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    id="signUpPassword"
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSignUpPassword(val);
                      setPasswordStrength(val ? evaluatePasswordStrength(val) : { score: 0, label: "", textColor: "", barColor: "" });
                    }}
                    className="w-full px-3 py-2  text-sm bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
                    placeholder="Enter password"
                  />
                  {signUpPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1" aria-hidden>
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const filled = idx < passwordStrength.score;
                          return (
                            <div
                              key={idx}
                              className={`${filled ? passwordStrength.barColor : "bg-gray-200"} h-1.5 flex-1 rounded`}
                            />
                          );
                        })}
                      </div>
                      <div className={`mt-1 text-xs font-medium ${passwordStrength.textColor}`}>
                        Password strength: {passwordStrength.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-medium text-[#273815]"
                    >
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="flex items-center text-xs text-[#273815]"
                    >
                      {showConfirmPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2  text-sm bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
                    placeholder="Re-enter password"
                  />
                </div>

                <button
                  onClick={handleSignUp}
                  className="w-full bg-[#636B2F] hover:bg-[#4d5323] cursor-pointer text-white font-semibold py-2.5 px-3 rounded-full shadow-md"
                >
                  Sign Up
                </button>

                <p className="text-center text-xs text-gray-600">
                  By signing up, you agree to Refurnish's{" "}
                  <Link href="/help/terms" className="text-[#636B2F] underline hover:text-[#4d5323]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/help/privacy" className="text-[#636B2F] underline hover:text-[#4d5323]">
                    Privacy Policy
                  </Link>
                </p>

                <p className="text-center text-sm text-[#273815]">
                  Already have an account?{" "}
                  <button
                    onClick={closeSignUp}
                    className="text-[#273815] cursor-pointer font-semibold underline"
                  >
                    Log in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
