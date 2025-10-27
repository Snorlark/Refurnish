"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { Star, MapPin, MessageCircle, Heart, Share2, Settings, Plus, ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';
import { UserProfileSkeleton } from '../../../components/SkeletonLoader';
import UserListModal from '../../../components/UserListModal';
import ChatBubble from '../../../components/ChatBubble';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  profilePicture?: string;
  contactNumber?: string;
  address?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt?: string;
  isEmailVerified?: boolean;
  followerCount?: number;
  followingCount?: number;
}

interface SellerProfile {
  _id: string;
  userId: string;
  shopName?: string;
  shopDescription?: string;
  address?: string;
  contactNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  documents?: string[];
  createdAt: string;
}

interface SellerStats {
  totalProducts: number;
  totalSales: number;
  activeOrders: number;
  averageRating: number;
}

interface Product {
  _id: string;
  title: string;
  price?: number;
  images: string[];
  status: 'for_approval' | 'listed' | 'sold' | 'swapped';
  listedAs: 'sale' | 'swap';
  category: string;
  description: string;
  condition: string;
  location: string;
  material?: string;
  quantity: number;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  reviewer: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  product: {
    name: string;
    images: string[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, token } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'categories' | 'reviews'>('home');
  const [productFilter, setProductFilter] = useState<'all' | 'for_sale' | 'for_swap' | 'purchased' | 'swapped'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [chatUser, setChatUser] = useState<any>(null);

  const email = decodeURIComponent(params.email as string);

  console.log('Raw email param:', params.email);
  console.log('Decoded email:', email);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Process email - if it doesn't contain @, add @gmail.com
      const processedEmail = email.includes('@') ? email : `${email}@gmail.com`;
      
      console.log('Fetching profile for email:', processedEmail);

      // Fetch user profile
        const profileRes = await fetch(`${API_BASE_URL}/api/users/profile/${processedEmail}`, {
          headers: { 'Content-Type': 'application/json' },
        });

      if (!profileRes.ok) {
          const errorText = await profileRes.text();
          throw new Error(`User not found: ${errorText}`);
      }

      const profileData = await profileRes.json();
      console.log('Profile data from API:', profileData);
      setProfileUser(profileData);

      // Check follow status if user is logged in and not viewing their own profile
      if (token && profileData._id !== (currentUser as any)?._id) {
        try {
          const followStatusRes = await fetch(`${API_BASE_URL}/api/users/follow-status/${profileData._id}`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });

          if (followStatusRes.ok) {
            const followStatus = await followStatusRes.json();
            setIsFollowing(followStatus.isFollowing);
          }
        } catch (err) {
          console.log('Error checking follow status:', err);
        }
      }

      // Fetch user's products
        try {
          const productsRes = await fetch(`${API_BASE_URL}/api/products/user/${profileData._id}`, {
            headers: { 'Content-Type': 'application/json' },
          });

          if (productsRes.ok) {
            const productsData = await productsRes.json();
            setProducts(productsData);
            console.log('Products loaded:', productsData.length);
          }
        } catch (err) {
          console.log('Error fetching products:', err);
        setProducts([]);
        }

      // Fetch seller profile and stats if user is a seller
        if (profileData.role === 'seller') {
          try {
          // Fetch seller profile
          const sellerProfileRes = await fetch(`${API_BASE_URL}/api/seller/me`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });

          if (sellerProfileRes.ok) {
            const sellerProfileData = await sellerProfileRes.json();
            setSellerProfile(sellerProfileData);
            console.log('Seller profile loaded:', sellerProfileData);
          }

          // Fetch seller stats
          const sellerStatsRes = await fetch(`${API_BASE_URL}/api/seller/stats`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });

          if (sellerStatsRes.ok) {
            const sellerStatsData = await sellerStatsRes.json();
            setSellerStats(sellerStatsData);
            console.log('Seller stats loaded:', sellerStatsData);
          }
        } catch (err) {
          console.log('Error fetching seller data:', err);
        }

        // Create mock reviews for now (since we don't have a reviews API yet)
            const mockReviews = [
              {
                _id: 'review1',
                reviewer: {
                  firstName: 'John',
                  lastName: 'Doe',
                  profilePicture: undefined
                },
                rating: 5,
                comment: 'Great seller! Fast delivery and excellent communication.',
                createdAt: new Date().toISOString(),
                product: {
                  name: 'Sample Product',
                  images: []
                }
              },
              {
                _id: 'review2',
                reviewer: {
                  firstName: 'Jane',
                  lastName: 'Smith',
                  profilePicture: undefined
                },
                rating: 4,
                comment: 'Good quality product, would buy again.',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                product: {
                  name: 'Another Product',
                  images: []
                }
              }
            ];
            setReviews(mockReviews);
        } else {
        // For buyers, show mock reviews they've made
            const mockBuyerReviews = [
              {
                _id: 'buyer_review1',
                reviewer: {
                  firstName: profileData.firstName,
                  lastName: profileData.lastName,
                  profilePicture: profileData.profilePicture
                },
                rating: 5,
                comment: 'Loved this product! Exactly as described.',
                createdAt: new Date().toISOString(),
                product: {
                  name: 'Purchased Item',
                  images: []
                }
              }
            ];
            setReviews(mockBuyerReviews);
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [email, token]); // Only re-create when email or token changes

  // Fetch user profile on mount or when dependencies change
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleFollow = async () => {
    if (!profileUser || !token || isFollowLoading) return;

    console.log('Attempting to follow user:', profileUser._id);
    console.log('API URL:', `${API_BASE_URL}/api/users/${profileUser._id}/follow`);
    console.log('Token:', token ? 'Present' : 'Missing');

    setIsFollowLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/follow/${profileUser._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      if (res.ok) {
        setIsFollowing(true);
        setProfileUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 0) + 1 } : null);
        console.log('Successfully followed user');
      } else {
        // Check if response is HTML (error page)
        const contentType = res.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (contentType && contentType.includes('text/html')) {
          const htmlText = await res.text();
          console.error('API returned HTML instead of JSON:', htmlText.substring(0, 200));
          alert('Server error. Please try again later.');
        } else {
          const errorData = await res.json();
          console.error('Follow error:', errorData);
          alert(errorData.error || 'Failed to follow user');
        }
      }
    } catch (err) {
      console.error('Error following user:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profileUser || !token || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/follow/${profileUser._id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        setIsFollowing(false);
        setProfileUser(prev => prev ? { ...prev, followerCount: Math.max((prev.followerCount || 0) - 1, 0) } : null);
      } else {
        // Check if response is HTML (error page)
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('API returned HTML instead of JSON. Server might be down.');
          alert('Server error. Please try again later.');
        } else {
          const errorData = await res.json();
          console.error('Unfollow error:', errorData.error);
          alert(errorData.error || 'Failed to unfollow user');
        }
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser?.firstName} ${profileUser?.lastName}'s Profile`,
          text: `Check out ${profileUser?.firstName} ${profileUser?.lastName}'s profile on Refurnish!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  const getFilteredProducts = () => {
    if (!profileUser) return [];

    let filteredProducts = products;

    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    // Apply product type filter
    if (profileUser.role === 'seller') {
      switch (productFilter) {
        case 'for_sale':
          return filteredProducts.filter(p => p.listedAs === 'sale');
        case 'for_swap':
          return filteredProducts.filter(p => p.listedAs === 'swap');
        default:
          return filteredProducts;
      }
    } else {
      switch (productFilter) {
        case 'purchased':
          return filteredProducts.filter(p => p.status === 'sold');
        case 'swapped':
          return filteredProducts.filter(p => p.status === 'swapped');
        default:
          return filteredProducts;
      }
    }
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isSeller = profileUser.role === 'seller';
  const isCurrentUser = (currentUser as any)?._id === profileUser._id || 
                       (currentUser as any)?.email === profileUser.email ||
                       (currentUser as any)?.email === email ||
                       (currentUser as any)?.email === `${email}@gmail.com`;

  console.log('Current user:', currentUser);
  console.log('Profile user:', profileUser);
  console.log('Email from URL:', email);
  console.log('Is current user:', isCurrentUser);

  return (
    <div className="w-full">

      {/* Profile Header */}
      <div className={`${
        profileUser.role === 'seller' 
          ? 'bg-gradient-to-r from-white to-green-100' 
          : profileUser.role === 'admin'
          ? 'bg-gradient-to-r from-white to-purple-100'
          : 'bg-gradient-to-r from-white to-blue-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                {profileUser.profilePicture ? (
                  <img
                    src={profileUser.profilePicture}
                    alt={`${profileUser.firstName} ${profileUser.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-green-600">
                    {profileUser.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {`${profileUser.firstName} ${profileUser.lastName}`}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profileUser.role === 'seller' 
                        ? 'bg-green-100 text-green-800' 
                        : profileUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profileUser.role === 'seller' ? 'Seller' : 
                       profileUser.role === 'admin' ? 'Admin' : 'Buyer'}
                    </span>
                  </div>
              
       
                  <p className="text-sm font-medium text-gray-600 mb-4">
                      {profileUser.email}
                    </p>   
                    
         
                  

                 

                  {/* Action Buttons on the left */}
                  <div className="flex items-center space-x-3 mb-4">
                    {isCurrentUser ? (
                      <>
                        <Link
                          href="/profile/account"
                          className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Link>
                        {isSeller && (
                          <Link
                            href="/profile/seller-dashboard-access"
                            className="inline-flex items-center px-6 py-2 border border-(--color-olive) rounded-lg text-sm font-medium text-white bg-(--color-olive) hover:bg-brown-500 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={isFollowing ? handleUnfollow : handleFollow}
                          disabled={isFollowLoading}
                          className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            isFollowing 
                              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                              : 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
                          } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                          {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                        </button>
                          <button 
                            onClick={() => {
                              if (profileUser) {
                                setChatUser({
                                  id: profileUser._id,
                                  email: profileUser.email,
                                  firstName: profileUser.firstName,
                                  lastName: profileUser.lastName
                                });
                              }
                            }}
                            className="inline-flex items-center px-6 py-2 bg-green-600 rounded-lg border border-green-600 text-sm font-medium text-white hover:bg-green-900 transition-colors"
                          >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat Now
                        </button>
                        <button 
                          onClick={handleShare}
                          className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                          title="Share Profile"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {sellerProfile?.shopDescription && (
                    <p className="text-gray-700 text-sm">{sellerProfile.shopDescription}</p>
                  )}
                </div>

                {/* Stats on the right */}
                <div className="flex items-center space-x-8 ml-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-(--color-olive)">{products.length}</div>
                    <div className="text-sm text-gray-600 font-medium">
                      {isSeller ? 'Products' : 'Items'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-(--color-olive)">{reviews.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Reviews</div>
                    </div>
                   <div 
                     className="text-center cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors group"
                     onClick={() => setShowFollowersModal(true)}
                   >
                       <div className="text-3xl font-bold text-(--color-olive) group-hover:text-green-900 transition-colors">{profileUser.followerCount || 0}</div>
                     <div className="text-sm text-gray-600 font-medium group-hover:text-green-800 transition-colors">Followers</div>
                     </div>
                  <div 
                    className="text-center cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors group"
                    onClick={() => setShowFollowingModal(true)}
                  >
                    <div className="text-3xl font-bold text-(--color-olive) group-hover:text-green-900 transition-colors">{profileUser.followingCount || 0}</div>
                    <div className="text-sm text-gray-600 font-medium group-hover:text-green-800 transition-colors">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${
        profileUser.role === 'seller' 
          ? 'bg-gradient-to-r from-white to-green-100' 
          : profileUser.role === 'admin'
          ? 'bg-gradient-to-r from-white to-purple-100'
          : 'bg-gradient-to-r from-white to-blue-100'
      } border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'home'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            {isSeller && (
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Categories
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors mr-2">
                    <Store className="w-4 h-4 text-(--color-olive)" />
                  </div>
                  <h3 className="text-lg font-semibold text-(--color-olive)">
                    {isSeller ? 'Store & Contact' : 'Profile Information'}
              </h3>
                </div>                
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Email */}
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-900 font-medium truncate w-full">{profileUser.email}</p>
                  </div>

                  {/* Contact Number */}
                  {(profileUser.contactNumber || (isSeller && sellerProfile?.contactNumber)) && (
                    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">Contact</p>
                      <p className="text-sm text-gray-900 font-medium">{profileUser.contactNumber || sellerProfile?.contactNumber}</p>
                    </div>
                  )}

                  {/* Address */}
                  {(profileUser.address || (isSeller && sellerProfile?.address)) && (
                    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                </div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-gray-900 font-medium">{profileUser.address || sellerProfile?.address}</p>
                    </div>
                  )}

                  {/* Shop Name */}
                  {isSeller && sellerProfile?.shopName && (
                    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Store className="w-6 h-6 text-gray-600" />
                    </div>
                      <p className="text-xs text-gray-500 mb-1">Shop Name</p>
                      <p className="text-sm text-gray-900 font-medium">{sellerProfile.shopName}</p>
                    </div>
                  )}
                </div>
                
                {isSeller && sellerProfile?.shopDescription && (
                  <div className="mt-6">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">Shop Description</p>
                        <p className="text-gray-900 font-medium leading-relaxed">{sellerProfile.shopDescription}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-(--color-olive) group-hover:text-(--color-olive)-700">
                  {isSeller ? 'Total Products' : 'Total Items'}
                </h3>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-black">{products.length}</p>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  {isSeller ? 'Products listed' : 'Items purchased/swapped'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-(--color-olive) group-hover:text-(--color-olive)-700">Reviews</h3>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-black">{reviews.length}</p>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  {isSeller ? 'Customer reviews' : 'Reviews written'}
                </p>
              </div>

              {isSeller && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-(--color-olive) group-hover:text-(--color-olive)-700">Rating</h3>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <svg className="w-4 h-4 text-(--color-olive)" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                  <div className="flex items-center">
                      {renderStars(sellerStats?.averageRating || 4.5)}
                    </div>
                    <span className="ml-2 text-2xl font-bold text-(--color-olive) group-hover:text-(--color-olive)-700">
                      {(sellerStats?.averageRating || 4.5).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    {reviews.length} reviews
                  </p>
                </div>
              )}

              {!isSeller && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-(--color-olive) group-hover:text-(--color-olive)-700">Member Since</h3>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-(--color-olive) group-hover:text-(--color-olive)-700">
                    {profileUser.createdAt ? new Date(profileUser.createdAt).getFullYear() : '2024'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    Active member
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
                <div className="flex items-center">
                  <div className="mr-2 bg-gray-100 rounded-full p-1">
                    <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-(--color-olive)">Recent Activity</h3>
                </div>                
              </div>
              
              <div className="p-6">
              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                    <div key={product._id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden group-hover:shadow-sm transition-shadow">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-black transition-colors">{product.title}</h4>
                      <p className="text-sm text-gray-600">
                          {formatPrice(product.price || 0)} • 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'listed' ? 'bg-gray-200 text-gray-700' :
                            product.status === 'sold' ? 'bg-gray-300 text-gray-800' :
                            product.status === 'swapped' ? 'bg-gray-400 text-gray-900' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {product.status === 'listed' ? 'Available' : 
                         product.status === 'sold' ? 'Sold' :
                         product.status === 'swapped' ? 'Swapped' : 'Pending'}
                          </span>
                      </p>
                    </div>
                      <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                      {formatDate(product.createdAt)}
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No recent activity</p>
                      <p className="text-sm text-gray-400 mt-1">Start by adding some products!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-(--color-olive)">
                        {categoryFilter === 'all' ? 'All Products' : `${categoryFilter} Products`}
                      </h3>
                      {categoryFilter !== 'all' && (
                        <button
                          onClick={() => setCategoryFilter('all')}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center mt-1"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Clear category filter
                        </button>
                      )}
                    </div>
                  </div>
                <div className="flex space-x-2">
                  {isSeller ? (
                    <>
                      <button
                        onClick={() => setProductFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          productFilter === 'all'
                              ? 'bg-(--color-olive) text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setProductFilter('for_sale')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          productFilter === 'for_sale'
                              ? 'bg-(--color-olive) text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        For Sale
                      </button>
                      <button
                        onClick={() => setProductFilter('for_swap')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          productFilter === 'for_swap'
                              ? 'bg-(--color-olive) text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        For Swap
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setProductFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          productFilter === 'all'
                              ? 'bg-(--color-olive) text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setProductFilter('purchased')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          productFilter === 'purchased'
                              ? 'bg-(--color-olive) text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Purchased
                      </button>
                      <button
                        onClick={() => setProductFilter('swapped')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          productFilter === 'swapped'
                              ? 'bg-(--color-olive) text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Swapped
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

              <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredProducts().map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                  <div className="aspect-square bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                            alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                        {product.price && (
                        <p className="text-lg font-bold text-(--color-olive) mt-1">
                            {formatPrice(product.price || 0)}
                    </p>
                        )}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'listed'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'sold'
                          ? 'bg-blue-100 text-blue-800'
                          : product.status === 'swapped'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status === 'listed' ? 'Available' : 
                         product.status === 'sold' ? 'Sold' :
                         product.status === 'swapped' ? 'Swapped' : 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500">
                            {product.listedAs === 'sale' ? 'Sale' : 'Swap'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getFilteredProducts().length === 0 && (
              <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No products found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && isSeller && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-(--color-olive)">Product Categories</h3>
                </div>
              </div>
              
              <div className="p-6">
              <p className="text-gray-600 mb-6">Browse products by category</p>
              
              {getCategories().length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getCategories().map((category) => {
                    const categoryProducts = products.filter(p => p.category === category);
                    
                    return (
                      <div
                        key={category}
                         className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 group overflow-hidden"
                         onClick={() => {
                           // Filter products by this category
                           setCategoryFilter(category);
                           setProductFilter('all');
                           setActiveTab('products');
                         }}
                       >
                         <div className="p-6">
                           <div className="flex items-center justify-between mb-4">
                             <h4 className="font-bold text-gray-900 capitalize text-lg group-hover:text-green-600 transition-colors">
                               {category}
                             </h4>
                             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                               <span className="text-xl font-bold text-green-600">
                            {categoryProducts.length}
                          </span>
                             </div>
                        </div>
                        
                           <div className="mt-4 pt-4 border-t border-gray-100">
                             <div className="flex items-center justify-center text-green-600 group-hover:text-green-700">
                               <span className="text-sm font-medium">View Products</span>
                               <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                               </svg>
                          </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h4>
                  <p className="text-gray-600">Start adding products to see them organized by category</p>
                </div>
              )}
              </div>
            </div>

            {/* Category Stats */}
            {getCategories().length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-(--color-olive)">Category Overview</h3>
                  </div>
                </div>
                
                <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {products.filter(p => p.status === 'listed').length}
                    </div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {products.filter(p => p.status === 'sold').length}
                    </div>
                    <div className="text-sm text-gray-600">Sold</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {products.filter(p => p.status === 'swapped').length}
                    </div>
                    <div className="text-sm text-gray-600">Swapped</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {getCategories().length}
                    </div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-(--color-olive)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-(--color-olive)">
                {isSeller ? 'Customer Reviews' : 'My Reviews'}
              </h3>
                </div>
              </div>
              
              <div className="p-6">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        {review.reviewer.profilePicture ? (
                          <img
                            src={review.reviewer.profilePicture}
                            alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-bold text-green-600">
                            {review.reviewer.firstName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {review.reviewer.firstName} {review.reviewer.lastName}
                          </h4>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-1">{review.comment}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                          {isSeller && (
                            <span className="text-sm text-gray-600">
                              for {review.product.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {reviews.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No reviews yet</p>
                    <p className="text-sm text-gray-400 mt-1">Reviews will appear here when customers leave feedback</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {profileUser && (
          <>
            <UserListModal
              isOpen={showFollowersModal}
              onClose={() => setShowFollowersModal(false)}
              title="Followers"
              userId={profileUser._id}
              type="followers"
            />
            <UserListModal
              isOpen={showFollowingModal}
              onClose={() => setShowFollowingModal(false)}
              title="Following"
              userId={profileUser._id}
              type="following"
            />
          </>
        )}
        
        {/* ChatBubble Component */}
        <ChatBubble openWithUser={chatUser} />
      </div>
    </div>
  );
}
