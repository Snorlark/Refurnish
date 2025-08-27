"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Users } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface ListingRow {
  lister: string;
  category: string;
  product: string;
  price: string;
}

const listings: ListingRow[] = Array.from({ length: 9 }).map(() => ({
  lister: 'Billy Bob',
  category: 'Sofa Set',
  product: 'Narra Sofa Set',
  price: '10,000.01',
}));

const ProductModerationPage: React.FC = () => {
  const router = useRouter();
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', active: false },
    { label: 'User Management', href: '/admin/user-management', active: false },
    { label: 'Product Moderation', href: '/admin/product-moderation', active: true },
  ];

  return (
    <div className={`${montserrat.className} flex min-h-screen bg-gray-50`}>
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-sm">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/Rf-logo.svg" alt="Rf" width={40} height={40} />
            </div>
            <span className="text-lg font-medium text-gray-700">Admin Access</span>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Juan Dela Cruz</div>
              <div className="text-sm text-gray-500">Administrator</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-12">
            <div className="px-2">
              <div className="px-4 text-xs font-semibold tracking-wider text-gray-500 mb-3">NAVIGATION</div>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block w-full px-4 py-3 rounded-lg text-sm transition-colors ${
                      item.active
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <button onClick={() => router.push('/')} className="w-full text-left px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Log out
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Menu className="w-6 h-6 text-gray-600 mr-4" />
          <h1 className="text-2xl font-semibold text-gray-900">Product Moderation</h1>
        </div>

        {/* Top summary */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Listings for Approval (10)</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order statistics */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="text-sm text-gray-600 mb-3">Listings for Approval</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">20</div>
                <div className="h-1 rounded-full bg-red-400" style={{ width: '40%' }} />
              </div>
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="text-sm text-gray-600 mb-3">Active listings on website</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">50</div>
                <div className="h-1 rounded-full bg-blue-300" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          {/* Site earnings */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 w-fit h-fit justify-self-start">
            <div className="text-sm text-gray-600">Site earnings this month</div>
            <div className="mt-3 text-5xl font-extrabold text-gray-900">₱100K</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing by</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.lister}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => setIsEvaluateOpen(true)} className="px-4 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-900">Evaluate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Most sold furniture */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Most sold furniture</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Sofa Set</span>
                <span className="text-gray-500">96.42%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tables</span>
                <span className="text-gray-500">2.76%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Dresser</span>
                <span className="text-gray-500">0.82%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Storage</span>
                <span className="text-gray-500">12.3%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Evaluate Modal Overlay */}
        {isEvaluateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsEvaluateOpen(false)} />
            <div className="relative z-10 max-w-6xl w-[95%] bg-[#EAE5E1] rounded-3xl p-8 shadow-2xl text-gray-900">
              <div className="flex items-center mb-8">
                <button
                  onClick={() => setIsEvaluateOpen(false)}
                  className="mr-4 w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center"
                  aria-label="Back"
                >
                  ←
                </button>
                <h2 className="text-3xl font-semibold text-gray-900">Add New Product</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-900">Product Name :</div>
                    <div className="mt-1 font-semibold">Narra Sofa Set</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Category :</div>
                    <div className="mt-1">Sofa Set</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Condition :</div>
                    <div className="mt-1 font-semibold">Good - Like New</div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-sm text-gray-900">Material :</div>
                      <div className="mt-1">Wood</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Age :</div>
                      <div className="mt-1">10 years+</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Description : <span className="text-red-500">*</span></div>
                    <p className="mt-2 leading-relaxed text-gray-900">
                      Narra wood sofa set, 10 years old but still good as new. Solid hardwood frame with
                      beautiful natural grain, sturdy and elegant. Well-cushioned for comfort and built to last —perfect for any living space.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-900 mb-2">Images :</div>
                    <div className="flex flex-wrap gap-4">
                      <div className="w-36 h-28 bg-gray-300 rounded-xl" />
                      <div className="w-36 h-28 bg-gray-300 rounded-xl" />
                      <div className="w-36 h-28 bg-gray-300 rounded-xl" />
                      <div className="w-36 h-28 bg-gray-300 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-sm text-gray-900">Mode of Transaction :</div>
                      <div className="mt-1 font-medium">For sale</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Price :</div>
                      <div className="mt-1 font-medium">10,000.01</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Mode of Delivery :</div>
                      <div className="mt-1 font-medium">J&T Express, Lalamove, LBC Express</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Mode of Payment :</div>
                      <div className="mt-1 font-medium">GCash/Maya</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-6">
                <button onClick={() => setIsEvaluateOpen(false)} className="px-8 py-3 rounded-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-100">Cancel</button>
                <button className="px-8 py-3 rounded-full bg-green-900 text-white hover:bg-green-800">Accept</button>
                <button onClick={() => setIsEvaluateOpen(false)} className="px-8 py-3 rounded-full bg-red-500 text-white hover:bg-red-600">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModerationPage;


