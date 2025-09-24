"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, TrendingUp, ShoppingBag, Clock, Menu } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, PackageCheck } from "lucide-react";
import { useAuth } from '../../../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});
const navItems = [
  { label: 'Dashboard Overview', href: '/admin/dashboard', active: true, icon: <LayoutDashboard className="w-5 h-5 text-gray-500" /> },
  { label: 'User Management', href: '/admin/user-management', active: false, icon: <Users className="w-5 h-5 text-gray-500" /> },
  { label: 'Product Moderation', href: '/admin/product-moderation', active: false, icon: <PackageCheck className="w-5 h-5 text-gray-500" /> },
];
interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface Order {
  orderId: string;
  paymentMethod: string;
  orderDate: string;
  status: string;
  total: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
   { label: 'Dashboard Overview', href: '/admin/dashboard', active: true, icon: <LayoutDashboard className="w-5 h-5 text-gray-500" /> },
  { label: 'User Management', href: '/admin/user-management', active: false, icon: <Users className="w-5 h-5 text-gray-500" /> },
  { label: 'Product Moderation', href: '/admin/product-moderation', active: false, icon: <PackageCheck className="w-5 h-5 text-gray-500" /> },
];

  const stats: StatCard[] = [
    { title: "Users", value: "123", icon: <Users className="w-5 h-5" />, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "Site Visits", value: "1m", icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Sales", value: "₱100K", icon: <ShoppingBag className="w-5 h-5" />, color: "text-red-600", bgColor: "bg-red-100" },
    { title: "Pending Orders", value: "68", icon: <Clock className="w-5 h-5" />, color: "text-blue-600", bgColor: "bg-blue-100" }
  ];

  const recentOrders: Order[] = [
    { orderId: "123456789101", paymentMethod: "Cash", orderDate: "September 11, 2025", status: "Shipping", total: "₱1500" },
    { orderId: "123456789102", paymentMethod: "Gcash", orderDate: "September 12, 2025", status: "Pending", total: "₱2000" },
    { orderId: "123456789103", paymentMethod: "Card", orderDate: "September 13, 2025", status: "Delivered", total: "₱500" }
  ];

  const chartData = [
    { name: "Mon", sales: 4000, visits: 2400 },
    { name: "Tue", sales: 3000, visits: 1398 },
    { name: "Wed", sales: 2000, visits: 9800 },
    { name: "Thu", sales: 2780, visits: 3908 },
    { name: "Fri", sales: 1890, visits: 4800 },
    { name: "Sat", sales: 2390, visits: 3800 },
    { name: "Sun", sales: 3490, visits: 4300 }
  ];

  const handleEdit = (orderId: string) => console.log(`Edit order: ${orderId}`);
  const handleDelete = (orderId: string) => console.log(`Delete order: ${orderId}`);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 h-screen w-80 bg-white shadow-sm">
        <div className="w-80 bg-white shadow-sm h-screen flex flex-col">
        <div className="p-6 border-b flex-grow">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/Rf-logo.svg" alt="Rf" width={40} height={40} />
            </div>
            <span className="text-lg font-medium text-gray-700">Admin Access</span>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#636B2F] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm text-gray-500">Administrator</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8">
            <div className="px-2">
              <div className="px-4 text-xs font-medium tracking-wider text-gray-500 mb-3">NAVIGATION</div>
              
              <div className="space-y-2">
                {navItems.map((item) => (
                 
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-colors ${
                      item.active 
                        ? 'bg-gray-100 text-gray-900 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-4 h-4">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>

                ))}
              </div>

            </div>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-200 mt-auto">
          <button onClick={handleLogout} className="w-full cursor-pointer flex items-center justify-start gap-2 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <LogOut className="w-5 h-5 text-gray-500" />
            <span>Log out</span>
          </button>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${montserrat.className} flex-1 ml-80 p-8 overflow-y-auto`}>
        {/* Header */}
      <div className="flex items-center mb-6">
        <Menu className="w-5 h-5 text-gray-600 mr-3" />
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>

        {/* Statistics Cards */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Site statistics</h2>
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
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-red-500' : 'bg-blue-400'
                }`}
                style={{ width: '50%' }}
              ></div>
            </div>
          ))}
        </div>
      </div>
        {/* Recent Orders + Graphs */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table * /}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.paymentMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => handleDelete(order.orderId)} className="text-red-600 hover:text-red-900">Delete</button>
                          <button onClick={() => handleEdit(order.orderId)} className="text-blue-600 hover:text-blue-900">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            */}

          {/* Graphs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales & Visits</h2>
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

            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Weekly Sales</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
