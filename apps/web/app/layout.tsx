import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { WishlistProvider } from "../contexts/WishlistContext";
import SessionProvider from "../components/SessionProvider";
import SiteVisitTracker from "../components/SiteVisitTracker";
import ActivityTracker from "../components/ActivityTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Refurnish",
  description: "A Website that sells pre-loved furniture",
  icons: {
    icon: [
      { url: "/icon/RF.png", sizes: "32x32", type: "image/png" },
      { url: "/icon/RF.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/icon/RF.png",
    apple: "/icon/RF.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SiteVisitTracker />
                <ActivityTracker />
                {children}
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
