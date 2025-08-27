"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, TrendingUp, ShoppingBag, Clock, Menu } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// TypeScript interfaces
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
  // Sample data - in real app, this would come from MongoDB
  const navItems = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', active: true },
    { label: 'User Management', href: '/admin/user-management', active: false },
    { label: 'Product Moderation', href: '/admin/product-moderation', active: false },
  ];
  const stats: StatCard[] = [
    {
      title: "Users",
      value: "123",
      icon: <Users className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Site Visits", 
      value: "1m",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Sales",
      value: "₱100K",
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "text-red-600", 
      bgColor: "bg-red-100"
    },
    {
      title: "Pending Orders",
      value: "68",
      icon: <Clock className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  const recentOrders: Order[] = [
    {
      orderId: "123456789101",
      paymentMethod: "Cash",
      orderDate: "September 11, 2025",
      status: "Shipping",
      total: "₱1500"
    },
    {
      orderId: "123456789101", 
      paymentMethod: "Cash",
      orderDate: "September 11, 2025",
      status: "Shipping",
      total: "₱1500"
    },
    {
      orderId: "123456789101",
      paymentMethod: "Cash", 
      orderDate: "September 11, 2025",
      status: "Shipping",
      total: "₱1500"
    },
    {
      orderId: "123456789101",
      paymentMethod: "Cash",
      orderDate: "September 11, 2025", 
      status: "Shipping",
      total: "₱1500"
    },
    {
      orderId: "123456789101",
      paymentMethod: "Cash",
      orderDate: "September 11, 2025",
      status: "Shipping", 
      total: "₱1500"
    },
    {
      orderId: "123456789101",
      paymentMethod: "Cash",
      orderDate: "September 11, 2025",
      status: "Shipping",
      total: "₱1500"
    },
    {
      orderId: "123456789101",
      paymentMethod: "Cash",
      orderDate: "September 11, 2025", 
      status: "Shipping",
      total: "₱1500"
    }
  ];

  const handleEdit = (orderId: string) => {
    console.log(`Edit order: ${orderId}`);
  };

  const handleDelete = (orderId: string) => {
    console.log(`Delete order: ${orderId}`);
  };
  
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
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Site statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.title}
                </div>
                <div className={`mt-3 h-1 rounded-full ${
                  index === 0 ? 'bg-purple-500' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-red-500' : 'bg-blue-400'
                }`} style={{ width: '60%' }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleDelete(order.orderId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                        <button 
                          onClick={() => handleEdit(order.orderId)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


