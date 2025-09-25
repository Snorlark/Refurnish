"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Users, MoreVertical, Search } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, PackageCheck } from "lucide-react";
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface UserRow {
  id: string;
  name: string;
  email: string;
  createdDate: string;
  createdTime: string;
  status: 'Active' | 'Inactive' | 'Banned';
}

const UserManagementPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

  const navItems = [
  { label: 'Dashboard Overview', href: '/admin/dashboard', active: false, icon: <LayoutDashboard className="w-5 h-5 text-gray-500" /> },
  { label: 'User Management', href: '/admin/user-management', active: true, icon: <Users className="w-5 h-5 text-gray-500" /> },
  { label: 'Product Moderation', href: '/admin/product-moderation', active: false, icon: <PackageCheck className="w-5 h-5 text-gray-500" /> },
];

  const filteredUsers = users; // server-side filtered via query

  // Reset to first page when the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fetch users whenever page/search changes
  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(pageSize),
        });
        if (search.trim()) params.set('search', search.trim());
        const res = await fetch(`${API_BASE_URL}/api/users?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load users');

        const mapped: UserRow[] = (data.data || []).map((u: any) => {
          const created = new Date(u.createdDate);
          const createdDate = created.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          const createdTime = created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          return {
            id: u.id || u._id,
            name: u.name,
            email: u.email,
            createdDate,
            createdTime,
            status: (u.status as any) || 'Active',
          } as UserRow;
        });
        setUsers(mapped);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch {
        // Optionally show a toast
        setUsers([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
    return () => controller.abort();
  }, [token, API_BASE_URL, currentPage, pageSize, search]);

  const currentPageUsers = filteredUsers; // already paginated by server

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className='fixed top-0 left-0 h-screen w-80 bg-white shadow-sm"'> 
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
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Juan Dela Cruz</div>
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
          <button onClick={() => router.push('/')} className="w-full cursor-pointer flex items-center justify-start gap-2 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <LogOut className="w-5 h-5 text-gray-500" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
    
    <div className={`${montserrat.className} flex min-h-screen bg-gray-50`}>
      {/* Main Content */}
      <div className="flex-1 ml-80 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Menu className="w-5 h-5 text-gray-600 mr-3" /> 
          <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
        </div>

        {/* Users Title and Search */}
        <div className="mb-6">  
            <h2 className="text-base font-semibold text-gray-900 mb-3">Users ({filteredUsers.length})</h2>
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user name, email, or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {isLoading && (
            <div className="px-4 py-2 text-xs text-gray-500">Loading users…</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center mr-2 text-xs font-semibold">JD</div>
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">Sample User</div>
                          <div className="text-gray-500 text-xs">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-blue-600 underline">{user.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      <div>{user.createdDate}</div>
                      <div className="text-gray-500 text-xs">{user.createdTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{user.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      <button className="p-1 rounded hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4" /> {/* was w-5 h-5 */}
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-600">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <span className="text-gray-400">«</span>
              <span>Prev</span>
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 min-w-7 px-1.5 rounded-md text-xs ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button> 
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <span>Next</span>
              <span className="text-gray-400">»</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default UserManagementPage;

