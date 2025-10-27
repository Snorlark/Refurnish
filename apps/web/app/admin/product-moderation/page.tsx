"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import AdminSidebar from '../../../components/AdminSidebar';



interface Product {
  _id: string;
  title: string;
  description: string;
  price?: number;
  condition: string;
  category: string;
  images: string[];
  location: string;
  status: string;
  material: string;
  age: {
    value: number;
    unit: string;
  };
  listedAs: string;
  mode_of_payment: string;
  courier: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const ProductModerationPage: React.FC = () => {
  const router = useRouter();
  const { token, user } = useAuth();
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<{ month: string; commission: number } | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchProductsForApproval = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/for-approval`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products for approval');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchProductsForApproval();
  }, [fetchProductsForApproval]);

  const fetchActiveListingsCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products?status=listed`);
      if (res.ok) {
        const data = await res.json();
        setActiveListingsCount(Array.isArray(data) ? data.length : 0);
      } else {
        setActiveListingsCount(0);
      }
    } catch (error) {
      console.error('Error fetching active listings:', error);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchActiveListingsCount();
  }, [fetchActiveListingsCount]);

  const fetchMonthlyEarnings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/earnings/monthly`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyEarnings({ month: data.month, commission: data.commission || 0 });
      } else {
        setMonthlyEarnings({ month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), commission: 0 });
      }
    } catch (error) {
      console.error('Error fetching monthly earnings:', error);
      setMonthlyEarnings({ month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), commission: 0 });
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchMonthlyEarnings();
  }, [fetchMonthlyEarnings]);

  const handleModerateProduct = async (productId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Remove the product from the list
        setProducts(products.filter(p => p._id !== productId));
        setIsEvaluateOpen(false);
        setSelectedProduct(null);
        fetchActiveListingsCount();
      } else {
        console.error('Failed to moderate product');
      }
    } catch (error) {
      console.error('Error moderating product:', error);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return `₱${price.toLocaleString()}`;
  };

  const formatAge = (age: { value: number; unit: string }) => {
    return `${age.value} ${age.unit}`;
  };


  return (
    <ProtectedRoute requireAdmin={true}>
      <div className={`flex min-h-screen bg-gray-50`}>
        <AdminSidebar activePage="product-moderation" />
      {/* Main Content */}
      <div className="flex-1 ml-80 p-8 overflow-y-auto">
        {/* Header */}
       <div className="flex items-center mb-6">
          <Menu className="w-5 h-5 text-gray-600 mr-3" /> {/* was w-6 h-6 */}
          <h1 className="text-xl font-semibold text-gray-900">Product Moderation</h1> {/* was text-2xl */}
        </div>


        {/* Top summary */}
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Listings for Approval ({products.length})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order statistics */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="text-sm text-gray-600 mb-3">Listings for Approval</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{products.length}</div>
                <div className="h-1 rounded-full bg-red-400" style={{ width: `${Math.min(products.length * 5, 100)}%` }} />
              </div>
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="text-sm text-gray-600 mb-3">Active listings on website</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{activeListingsCount}</div>
                <div className="h-1 rounded-full bg-blue-300" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          {/* Site earnings */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 w-fit h-fit justify-self-start">
            <div className="text-sm text-gray-600">Site earnings ({monthlyEarnings?.month || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })})</div>
            <div className="mt-2 text-3xl font-extrabold text-gray-900">{
              monthlyEarnings ? `₱${monthlyEarnings.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
            }</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing by</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No products pending approval
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                          {product.owner.firstName} {product.owner.lastName}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">{product.title}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">{formatPrice(product.price)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm">
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEvaluateOpen(true);
                            }} 
                            className="px-3 py-1 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900"
                          >
                            Evaluate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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
        {isEvaluateOpen && selectedProduct && (
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
                <h2 className="text-3xl font-semibold text-gray-900">Product Evaluation</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-900">Product Name :</div>
                    <div className="mt-1 font-semibold">{selectedProduct.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Category :</div>
                    <div className="mt-1">{selectedProduct.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Condition :</div>
                    <div className="mt-1 font-semibold">{selectedProduct.condition}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-sm text-gray-900">Material :</div>
                      <div className="mt-1">{selectedProduct.material}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Age :</div>
                      <div className="mt-1">{formatAge(selectedProduct.age)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Description : <span className="text-red-500">*</span></div>
                    <p className="mt-2 leading-relaxed text-gray-900">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-900 mb-2">Images :</div>
                    <div className="flex flex-wrap gap-4">
                      {selectedProduct.images.map((image, index) => (
                        <div key={index} className="w-36 h-28 bg-gray-300 rounded-xl overflow-hidden">
                          <Image 
                            src={image} 
                            alt={`Product image ${index + 1}`}
                            width={144}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-sm text-gray-900">Mode of Transaction :</div>
                      <div className="mt-1 font-medium">{selectedProduct.listedAs}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Price :</div>
                      <div className="mt-1 font-medium">{formatPrice(selectedProduct.price)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Mode of Delivery :</div>
                      <div className="mt-1 font-medium">{selectedProduct.courier}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">Mode of Payment :</div>
                      <div className="mt-1 font-medium">{selectedProduct.mode_of_payment}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-6">
                <button onClick={() => setIsEvaluateOpen(false)} className="px-8 py-3 rounded-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-100">Cancel</button>
                <button 
                  onClick={() => handleModerateProduct(selectedProduct._id, 'approve')} 
                  className="px-8 py-3 rounded-full bg-green-900 text-white hover:bg-green-800"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleModerateProduct(selectedProduct._id, 'reject')} 
                  className="px-8 py-3 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default ProductModerationPage;

