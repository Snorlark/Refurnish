"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Star,
  DollarSign,
  Settings,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminSession } from '../../../hooks/useAdminSession';
import AdminSidebar from '../../../components/AdminSidebar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell
} from "recharts";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'product_upload' | 'seller_profile_update';
  title: string;
  description: string;
  timestamp: string;
  metadata: any;
}

interface TopSellingProduct {
  _id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
  location: string;
  salesCount: number;
  totalRevenue: number;
}

interface UserAnalytics {
  roleCounts: {
    buyer: number;
    seller: number;
    admin: number;
    total: number;
  };
  registrationTrends: Array<{
    date: string;
    buyer: number;
    seller: number;
    admin: number;
  }>;
  sellerApprovalStats: {
    approved: number;
    pending: number;
    total: number;
  };
}

interface RevenueAnalytics {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    salesCount: number;
  }>;
  revenueByCategory: Array<{
    _id: string;
    revenue: number;
    salesCount: number;
    avgPrice: number;
  }>;
  projections: {
    totalRevenue: number;
    avgMonthlyRevenue: number;
    projectedYearlyRevenue: number;
    timeRange: string;
  };
}

interface SystemSettings {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  productUploadEnabled: boolean;
  maxProductsPerUser: number;
  maxFileSize: string;
  allowedImageTypes: string[];
  siteDescription: string;
  contactEmail: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoadingUserCount, setIsLoadingUserCount] = useState(true);
  const [siteVisitsCount, setSiteVisitsCount] = useState<number>(0);
  const [isLoadingSiteVisits, setIsLoadingSiteVisits] = useState(true);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [pendingApprovalCount, setPendingApprovalCount] = useState<number>(0);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  
  // New state for enhanced dashboard
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([]);
  const [isLoadingTopProducts, setIsLoadingTopProducts] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoadingUserAnalytics, setIsLoadingUserAnalytics] = useState(true);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [isLoadingRevenueAnalytics, setIsLoadingRevenueAnalytics] = useState(true);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isLoadingSystemSettings, setIsLoadingSystemSettings] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [weeklyChartData, setWeeklyChartData] = useState<Array<{ name: string; sales: number; visits: number }>>([
    { name: "Mon", sales: 0, visits: 0 },
    { name: "Tue", sales: 0, visits: 0 },
    { name: "Wed", sales: 0, visits: 0 },
    { name: "Thu", sales: 0, visits: 0 },
    { name: "Fri", sales: 0, visits: 0 },
    { name: "Sat", sales: 0, visits: 0 },
    { name: "Sun", sales: 0, visits: 0 },
  ]);
  const [analyticsRangeLabel, setAnalyticsRangeLabel] = useState<string>("");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  // Initialize admin session handler
  useAdminSession({
    maxInactiveTime: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    checkInterval: 60 * 1000, // Check every minute
  });

  // Function to fetch user count
  const fetchUserCount = useCallback(async () => {
    try {
      setIsLoadingUserCount(true);
      const response = await fetch(`${API_BASE_URL}/api/users?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user count');
      }

      const data = await response.json();
      setUserCount(data.pagination.total);
    } catch (error) {
      console.error('Error fetching user count:', error);
      // Keep the default value of 0 if fetch fails
    } finally {
      setIsLoadingUserCount(false);
    }
  }, [token]);

  // Function to fetch site visits count
  const fetchSiteVisitsCount = useCallback(async () => {
    try {
      setIsLoadingSiteVisits(true);
      const response = await fetch(`${API_BASE_URL}/api/site-visits/total`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch site visits count');
      }

      const data = await response.json();
      setSiteVisitsCount(data.totalVisits);
    } catch (error) {
      console.error('Error fetching site visits count:', error);
      // Keep the default value of 0 if fetch fails
    } finally {
      setIsLoadingSiteVisits(false);
    }
  }, [token]);

  // Function to fetch total sales
  const fetchTotalSales = useCallback(async () => {
    try {
      setIsLoadingSales(true);
      const response = await fetch(`${API_BASE_URL}/api/products/total-sales`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch total sales');
      }

      const data = await response.json();
      setTotalSales(data.totalSales);
    } catch (error) {
      console.error('Error fetching total sales:', error);
      // Keep the default value of 0 if fetch fails
    } finally {
      setIsLoadingSales(false);
    }
  }, [token]);

  // Function to fetch weekly analytics (sales & visits Mon-Sun)
  const fetchWeeklyAnalytics = useCallback(async (startDate?: Date) => {
    try {
      const params = startDate ? `?startDate=${encodeURIComponent(startDate.toISOString())}` : '';
      const response = await fetch(`${API_BASE_URL}/api/products/analytics/weekly${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weekly analytics');
      }

      const data = await response.json();
      setWeeklyChartData(data.data || []);
      setAnalyticsRangeLabel(data.range?.label || "");
    } catch (error) {
      console.error('Error fetching weekly analytics:', error);
      // Keep zeros if fetch fails
      setWeeklyChartData([
        { name: "Mon", sales: 0, visits: 0 },
        { name: "Tue", sales: 0, visits: 0 },
        { name: "Wed", sales: 0, visits: 0 },
        { name: "Thu", sales: 0, visits: 0 },
        { name: "Fri", sales: 0, visits: 0 },
        { name: "Sat", sales: 0, visits: 0 },
        { name: "Sun", sales: 0, visits: 0 },
      ]);
      setAnalyticsRangeLabel("");
    } finally {
    }
  }, [token]);

  // Function to fetch pending approval count
  const fetchPendingApprovalCount = useCallback(async () => {
    try {
      setIsLoadingPending(true);
      const response = await fetch(`${API_BASE_URL}/api/products/for-approval`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending approval');
      }

      const data = await response.json();
      setPendingApprovalCount(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('Error fetching pending approval count:', error);
    } finally {
      setIsLoadingPending(false);
    }
  }, [token]);

  // New fetch functions for enhanced dashboard
  const fetchRecentActivities = useCallback(async () => {
    try {
      setIsLoadingActivities(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/recent-activities?limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }

      const data = await response.json();
      setRecentActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [token]);

  const fetchTopSellingProducts = useCallback(async () => {
    try {
      setIsLoadingTopProducts(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/top-selling-products?limit=5`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top selling products');
      }

      const data = await response.json();
      setTopSellingProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      setTopSellingProducts([]);
    } finally {
      setIsLoadingTopProducts(false);
    }
  }, [token]);

  const fetchUserAnalytics = useCallback(async () => {
    try {
      console.log('Fetching user analytics from:', `${API_BASE_URL}/api/admin/analytics/user-analytics`);
      setIsLoadingUserAnalytics(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/user-analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user analytics');
      }

      const data = await response.json();
      console.log('User Analytics Response:', data);
      setUserAnalytics(data);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setIsLoadingUserAnalytics(false);
    }
  }, [token]);

  const fetchRevenueAnalytics = useCallback(async () => {
    try {
      console.log('Fetching revenue analytics from:', `${API_BASE_URL}/api/admin/analytics/revenue-analytics?timeRange=30`);
      setIsLoadingRevenueAnalytics(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/revenue-analytics?timeRange=30`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue analytics');
      }

      const data = await response.json();
      console.log('Revenue Analytics Response:', data);
      setRevenueAnalytics(data);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    } finally {
      setIsLoadingRevenueAnalytics(false);
    }
  }, [token]);

  const fetchSystemSettings = useCallback(async () => {
    try {
      setIsLoadingSystemSettings(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/system-settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }

      const data = await response.json();
      setSystemSettings(data);
    } catch (error) {
      console.error('Error fetching system settings:', error);
    } finally {
      setIsLoadingSystemSettings(false);
    }
  }, [token]);

  // Fetch all data on mount
  useEffect(() => {
    if (token) {
      fetchUserCount();
      fetchSiteVisitsCount();
      fetchTotalSales();
      const now = new Date();
      setCurrentWeekStart(now);
      fetchWeeklyAnalytics(now);
      fetchPendingApprovalCount();
      
      // Fetch new analytics data
      fetchRecentActivities();
      fetchTopSellingProducts();
      fetchUserAnalytics();
      fetchRevenueAnalytics();
      fetchSystemSettings();
    }
  }, [token, fetchUserCount, fetchSiteVisitsCount, fetchTotalSales, fetchWeeklyAnalytics, fetchPendingApprovalCount, fetchRecentActivities, fetchTopSellingProducts, fetchUserAnalytics, fetchRevenueAnalytics, fetchSystemSettings]);

  // Helpers for week navigation
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + diff);
    return date;
  };

  const handlePrevWeek = () => {
    if (!currentWeekStart) return;
    const monday = getMonday(currentWeekStart);
    const prev = new Date(monday);
    prev.setDate(monday.getDate() - 7);
    setCurrentWeekStart(prev);
    fetchWeeklyAnalytics(prev);
  };

  const handleNextWeek = () => {
    if (!currentWeekStart) return;
    const monday = getMonday(currentWeekStart);
    const next = new Date(monday);
    next.setDate(monday.getDate() + 7);
    // Do not allow navigating into future weeks beyond current week's Monday
    const todayMonday = getMonday(new Date());
    if (next > todayMonday) return;
    setCurrentWeekStart(next);
    fetchWeeklyAnalytics(next);
  };


  // Helper functions
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'product_upload':
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case 'seller_profile_update':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const stats: StatCard[] = [
    { title: "Users", value: isLoadingUserCount ? "..." : userCount.toString(), icon: <Users className="w-5 h-5" />, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "Site Visits", value: isLoadingSiteVisits ? "..." : siteVisitsCount.toString(), icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Sales", value: isLoadingSales ? "..." : `₱${totalSales.toLocaleString()}`, icon: <ShoppingBag className="w-5 h-5" />, color: "text-red-600", bgColor: "bg-red-100" },
    { title: "Pending Approval", value: isLoadingPending ? "..." : pendingApprovalCount.toString(), icon: <Clock className="w-5 h-5" />, color: "text-blue-600", bgColor: "bg-blue-100" }
  ];

  const chartData = weeklyChartData;


  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePage="dashboard" />

      {/* Main Content */}
      <div className={`${montserrat.className} flex-1 ml-80 p-8 overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Menu className="w-5 h-5 text-gray-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={() => {
              fetchRecentActivities();
              fetchTopSellingProducts();
              fetchUserAnalytics();
              fetchRevenueAnalytics();
            }}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Site Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                        <div className={`${stat.color} w-4 h-4`}>{stat.icon}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.title}</div>
                    <div
                      className={`mt-2 h-1 rounded-full ${
                        index === 0 ? 'bg-purple-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: '50%' }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activities
                </h2>
              </div>
              <div className="p-6">
                {isLoadingActivities ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading activities...</p>
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activities found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Top Selling Products
                </h2>
              </div>
              <div className="p-6">
                {isLoadingTopProducts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                ) : topSellingProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topSellingProducts.map((product, index) => (
                      <div key={product._id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                          <p className="text-sm text-gray-600">{product.category} • {product.location}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">₱{((product?.price ?? 0) as number).toLocaleString()}</span>
                            {(product?.salesCount ?? 0) > 0 && (
                              <span className="text-xs text-green-600 font-medium">{product?.salesCount ?? 0} sales</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="text-lg font-bold text-gray-900">#{index + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No products found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Charts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Sales & Visits</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevWeek}
                    className="p-1 rounded-md hover:bg-gray-100"
                    aria-label="Previous week"
                    title="Previous week"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextWeek}
                    className="p-1 rounded-md hover:bg-gray-100"
                    aria-label="Next week"
                    title="Next week"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
              {analyticsRangeLabel && (
                <div className="text-xs text-gray-500 mb-3">{analyticsRangeLabel}</div>
              )}
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* User Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  User Analytics
                </h2>
              </div>
              <div className="p-6">
                {isLoadingUserAnalytics ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading user analytics...</p>
                  </div>
                ) : userAnalytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{userAnalytics.roleCounts.buyer}</div>
                      <div className="text-sm text-gray-600">Buyers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{userAnalytics.roleCounts.seller}</div>
                      <div className="text-sm text-gray-600">Sellers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{userAnalytics.roleCounts.admin}</div>
                      <div className="text-sm text-gray-600">Admins</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No user analytics available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Revenue Analytics
                </h2>
              </div>
              <div className="p-6">
                {isLoadingRevenueAnalytics ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading revenue analytics...</p>
                  </div>
                ) : revenueAnalytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">₱{revenueAnalytics.projections.totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">₱{revenueAnalytics.projections.avgMonthlyRevenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Avg Monthly</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">₱{revenueAnalytics.projections.projectedYearlyRevenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Projected Yearly</div>
                      </div>
                    </div>
                    
                    {revenueAnalytics.revenueByCategory.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue by Category</h3>
                        <div className="space-y-3">
                          {revenueAnalytics.revenueByCategory.slice(0, 5).map((category) => (
                            <div key={category._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{category._id}</div>
                                <div className="text-xs text-gray-600">{category.salesCount || 0} sales</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">₱{(category.revenue || 0).toLocaleString()}</div>
                                <div className="text-xs text-gray-600">₱{(category.avgPrice || 0).toLocaleString()} avg</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No revenue analytics available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  System Settings
                </h2>
              </div>
              <div className="p-6">
                {isLoadingSystemSettings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading settings...</p>
                  </div>
                ) : systemSettings ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                        <input
                          type="text"
                          value={systemSettings.siteName}
                          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                        <input
                          type="email"
                          value={systemSettings.contactEmail}
                          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                      <textarea
                        value={systemSettings.siteDescription}
                        rows={3}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.maintenanceMode}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled
                        />
                        <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.registrationEnabled}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled
                        />
                        <label className="text-sm font-medium text-gray-700">Registration Enabled</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.productUploadEnabled}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled
                        />
                        <label className="text-sm font-medium text-gray-700">Product Upload Enabled</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Products Per User</label>
                        <input
                          type="number"
                          value={systemSettings.maxProductsPerUser}
                          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size</label>
                        <input
                          type="text"
                          value={systemSettings.maxFileSize}
                          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No system settings available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
