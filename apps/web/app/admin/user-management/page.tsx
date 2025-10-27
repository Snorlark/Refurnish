"use client";
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Users, MoreVertical, Search } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import AdminSidebar from '../../../components/AdminSidebar';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  profilePicture?: string;
  createdDate: string;
  createdTime: string;
  status: 'Active' | 'Inactive' | 'Banned';
}

const UserManagementPage: React.FC = () => {
  const router = useRouter();
  const { token, user } = useAuth();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';
  const SOCKET_URL = API_BASE_URL.replace(/\/$/, '');

  // Action menu and modals state
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [updateForm, setUpdateForm] = useState({ firstName: '', lastName: '', email: '', role: 'buyer' as 'buyer' | 'seller' | 'admin' });
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Close action menu when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setOpenMenuIndex(null);
      }
    };
    if (openMenuIndex !== null) {
      document.addEventListener('click', onDocClick);
    }
    return () => document.removeEventListener('click', onDocClick);
  }, [openMenuIndex]);


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
          const createdAt: string | number | Date = u.createdAt || u.createdDate;
          const created = createdAt ? new Date(createdAt) : new Date();
          const createdDate = created.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
          const createdTime = created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          const fullName = (u.name
            || [u.firstName, u.lastName].filter(Boolean).join(' ')
            || '').trim();
          return {
            id: u.id || u._id,
            name: fullName || u.email,
            email: u.email,
            role: u.role as 'buyer' | 'seller' | 'admin',
            profilePicture: u.profilePicture,
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

  // Fetch active users
  const fetchActiveUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveUsers(new Set(data.map((user: any) => user._id)));
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  // Fetch active users on mount and every 30 seconds
  useEffect(() => {
    if (!token) return;
    
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Socket.IO: auto-refresh on user updates/deletes
  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });
    const onChange = () => setCurrentPage((p) => p);
    socket.on('user_updated', onChange);
    socket.on('user_deleted', onChange);
    return () => {
      socket.off('user_updated', onChange);
      socket.off('user_deleted', onChange);
      socket.disconnect();
    };
  }, [token, SOCKET_URL]);

  const currentPageUsers = filteredUsers; // already paginated by server

  // Helpers
  const openUpdateFor = (u: UserRow) => {
    setSelectedUser(u);
    const [firstName = '', ...rest] = (u.name || '').split(' ');
    const lastName = rest.join(' ').trim();
    setUpdateForm({ firstName, lastName, email: u.email, role: u.role });
    setOpenMenuIndex(null);
    setShowUpdateModal(true);
    setUpdateError(null);
  };

  const openDeleteFor = (u: UserRow) => {
    setSelectedUser(u);
    setAdminPassword('');
    setOpenMenuIndex(null);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const refreshUsers = async () => {
    // Re-run current fetch by toggling page to itself
    setCurrentPage((p) => p);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !token) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setUpdateError(err?.message || 'Failed to update user');
        return;
      }
      setShowUpdateModal(false);
      await refreshUsers();
    } catch (err) {
      console.error(err);
      setUpdateError((err as Error)?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !token) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setDeleteError(err?.message || 'Failed to delete user');
        return;
      }
      setShowDeleteModal(false);
      await refreshUsers();
    } catch (err) {
      console.error(err);
      setDeleteError((err as Error)?.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className={`${montserrat.className} flex min-h-screen bg-gray-50`}>
        <AdminSidebar activePage="user-management" />
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
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
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
                      <Image src={user.profilePicture || '/icon/userIcon.png'} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover mr-2" />
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">{user.name}</div>
                          <div className="text-gray-500 text-xs">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-blue-600 underline">{user.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      <div>{user.createdDate}</div>
                      <div className="text-gray-500 text-xs">{user.createdTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {activeUsers.has(user.id) ? (
                          <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Online
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'Active' ? 'text-green-800 bg-green-100' :
                            user.status === 'Inactive' ? 'text-yellow-800 bg-yellow-100' :
                            'text-red-800 bg-red-100'
                          }`}>
                            {user.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap z-50 text-right text-sm text-gray-500 relative" data-action-menu>
                      <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuIndex === index && (
                        <div className="relative right-0  z-60 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg" data-action-menu>
                          <div>
                          <button
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                            onClick={() => openUpdateFor(user)}
                          >
                            Update
                          </button>
                          </div>

                          <div>
                          <button
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-50"
                            onClick={() => openDeleteFor(user)}
                          >
                            Delete
                          </button>
                          </div>
                        </div>
                      )}
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
      {/* Update Modal */}
    {showUpdateModal && selectedUser && (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Update User</h3>
          {updateError && <div className="mb-3 text-xs text-red-600">{updateError}</div>}
          <form onSubmit={handleUpdateSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                value={updateForm.firstName}
                onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                value={updateForm.lastName}
                onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={updateForm.email}
                onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Role</label>
              <select
                value={updateForm.role}
                onChange={(e) => setUpdateForm({ ...updateForm, role: e.target.value as 'buyer' | 'seller' | 'admin' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="buyer">buyer</option>
                <option value="seller">seller</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-3 py-2 text-xs rounded-md border" onClick={() => setShowUpdateModal(false)}>Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-3 py-2 text-xs rounded-md bg-blue-600 text-white disabled:opacity-60">{isSubmitting ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Delete Modal */}
    {showDeleteModal && selectedUser && (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Delete User</h3>
          {deleteError && <div className="mb-2 text-xs text-red-600">{deleteError}</div>}
          <p className="text-xs text-gray-600 mb-4">Enter your admin password to confirm deleting <span className="font-semibold">{selectedUser.name}</span>.</p>
          <form onSubmit={handleDeleteSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-3 py-2 text-xs rounded-md border" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-3 py-2 text-xs rounded-md bg-red-600 text-white disabled:opacity-60">{isSubmitting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </ProtectedRoute>
  );
};

export default UserManagementPage;