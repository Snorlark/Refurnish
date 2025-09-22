"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff,  XCircle, CheckCircle  } from "lucide-react";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setAlert(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!email || !password) {
        setAlert({ type: "error", message: "Please enter both email and password." });
        return;
      }
      router.push("/admin/dashboard");
      console.log("Login attempt:", { email, password });
      setAlert({ type: "success", message: "Login successful! Redirecting..." });

    } catch (error) {
      setAlert({ type: "error", message: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
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
    if (!firstName || !lastName || !signUpEmail || !signUpPassword || !confirmPassword) {
      setAlert({ type: "error", message: "Please fill in all fields." });
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }
    setIsSignUpOpen(false);
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
          <div className="text-center mb-8">
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
                className="text-3xl font-bold text-white tracking-wider hidden"
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
            <div className="space-y-4">
              

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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F] transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F] transition-all"
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
                  className="text-[#273815] font-semibold underline hover:text-gray-900"
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
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
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
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
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
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
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
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
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
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[#273815] focus:outline-none focus:ring-2 focus:ring-[#636B2F]"
                    placeholder="Re-enter password"
                  />
                </div>

                <button
                  onClick={handleSignUp}
                  className="w-full bg-[#636B2F] text-white font-semibold py-2.5 px-3 rounded-full shadow-md"
                >
                  Sign Up
                </button>

                <p className="text-center text-sm text-[#273815]">
                  Already have an account?{" "}
                  <button
                    onClick={closeSignUp}
                    className="text-[#273815] font-semibold underline"
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
