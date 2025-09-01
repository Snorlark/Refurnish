"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Users, MoreVertical, Search } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';

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

const sampleUsers: UserRow[] = Array.from({ length: 9 }).map((_, idx) => ({
  id: `123456789`,
  name: 'Sample User',
  email: idx % 3 === 0 ? 'SampleUser@email.com' : idx % 3 === 1 ? 'SampleUser@email.com' : 'SampleUser@email.com',
  createdDate: 'Sept 11, 2025',
  createdTime: '09:11',
  status: 'Active',
}));

const UserManagementPage: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', active: false },
    { label: 'User Management', href: '/admin/user-management', active: true },
    { label: 'Product Moderation', href: '/admin/product-moderation', active: false },
  ];

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return sampleUsers;
    }
    const term = search.trim().toLowerCase();
    return sampleUsers.filter((u) =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term)
    );
  }, [search]);

  // Reset to first page when the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

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
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        </div>

        {/* Users Title and Search */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Users ({filteredUsers.length})</h2>
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user name, email, or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center mr-3 text-sm font-semibold">JD</div>
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">Sample User</div>
                          <div className="text-gray-500 text-xs">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{user.createdDate}</div>
                      <div className="text-gray-500 text-xs">{user.createdTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{user.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      <button className="p-1 rounded hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-600">
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
                    className={`h-8 min-w-8 px-2 rounded-md text-xs ${
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
  );
};

export default UserManagementPage;

