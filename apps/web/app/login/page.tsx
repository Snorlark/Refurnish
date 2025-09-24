"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, XCircle, CheckCircle } from "lucide-react";
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

  const handleLogin = async () => {
    setAlert(null);

    try {
      if (!email || !password) {
        setAlert({ type: "error", message: "Please enter both email and password." });
        return;
      }

      // Check for hardcoded admin credentials
      const isAdminCredential = email === "admin@refurnish.dev" && password === "Refurnish2024!@#Admin";
      
      await login(email, password, isAdminCredential ? "REFURNISH_ADMIN_SECRET_2024" : undefined);
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

      await register(firstName, lastName, signUpEmail, signUpPassword);
      setAlert({ type: "success", message: "Registration successful! Redirecting..." });
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
                disabled={isLoading || !email || !password}
                className="w-full bg-[#636B2F] text-white font-semibold py-2.5 px-3 rounded-full shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Log In"}
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
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-3 py-2  text-sm bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
                    placeholder="Enter password"
                  />
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
