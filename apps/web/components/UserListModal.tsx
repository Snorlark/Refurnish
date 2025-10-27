"use client";
import { useState, useEffect, useCallback } from 'react';
import { X, User, Mail, Crown, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: 'buyer' | 'seller' | 'admin';
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userId: string;
  type: 'followers' | 'following';
}

const UserListModal = ({ isOpen, onClose, title, userId, type }: UserListModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError('Please log in to view this information');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const url = `${API_BASE_URL}/api/users/${endpoint}/${userId}`;
      console.log(`Fetching ${type} from:`, url);
      console.log(`Using token:`, token ? 'Token present' : 'No token');
      
      const res = await fetch(url, {
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });
      console.log(`Response status:`, res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`Received data:`, data);
        
        // Handle case where API returns empty object or missing data
        if (!data || typeof data !== 'object') {
          console.warn(`Invalid data format received:`, data);
          setUsers([]);
        } else if (Array.isArray(data[type])) {
          setUsers(data[type]);
        } else if (Array.isArray(data)) {
          // Handle case where API returns array directly
          setUsers(data);
        } else {
          console.warn(`Expected array for ${type}, got:`, data[type]);
          setUsers([]);
        }
      } else {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: 'Unknown error' };
        }
        
        console.error(`Error fetching ${type}:`, errorData);
        
        // Handle case where errorData is empty object
        if (errorData && Object.keys(errorData).length === 0) {
          errorData = { error: `Failed to load ${type}` };
        }
        
        // Handle different error message formats
        const errorMessage = errorData?.error || errorData?.message || `Failed to load ${type}`;
        
        if (res.status === 401) {
          setError('Please log in to view this information');
        } else if (res.status === 403) {
          setError(`${type === 'followers' ? 'Followers' : 'Following'} list is private`);
        } else if (res.status === 404) {
          setError('User not found');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [token, userId, type, API_BASE_URL]);

  useEffect(() => {
    if (isOpen && userId && token) {
      fetchUsers();
    }
  }, [isOpen, userId, token, fetchUsers]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'seller':
        return <ShoppingBag className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-blue-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'seller':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No {type} yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Link
                  key={user._id}
                  href={`/user-profile/${user.email}`}
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Profile Picture */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate group-hover:text-gray-700">
                        {user.firstName} {user.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>

                  {/* Role Icon */}
                  <div className="flex-shrink-0">
                    {getRoleIcon(user.role)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
