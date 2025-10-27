"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Calendar, Percent, Package, Eye, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminSession } from '../../../hooks/useAdminSession';
import AdminSidebar from '../../../components/AdminSidebar';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface CarouselSlide {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
  isFallback?: boolean;
}

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'advertisement' | 'discount' | 'sale';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  image?: string;
  link?: string;
}

interface FlashSaleSettings {
  _id: string;
  isActive: boolean;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  featuredProducts: Array<{
    _id: string;
    title: string;
    price: number;
    images: string[];
  }>;
  title: string;
  description?: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
}

const ContentManagementPage: React.FC = () => {
  const { token, user, isAdmin: authIsAdmin, isAuthenticated } = useAuth();
  useAdminSession(); // Add admin session management
  const [activeTab, setActiveTab] = useState<'carousel' | 'announcements' | 'flashsale'>('carousel');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fallback carousel slides (same as in shop/landing pages)
  const fallbackCarouselSlides = [
    {
      _id: 'fallback-1',
      title: 'Welcome to Refurnish',
      description: 'Your marketplace for sustainable furniture',
      image: '/bg-heropage.png',
      link: undefined,
      isActive: true,
      order: 1,
      isFallback: true
    },
    {
      _id: 'fallback-2', 
      title: 'Shop for Sale',
      description: 'Find amazing deals on quality furniture',
      image: '/sale-pic.png',
      link: undefined,
      isActive: true,
      order: 2,
      isFallback: true
    },
    {
      _id: 'fallback-3',
      title: 'Swap & Trade', 
      description: 'Exchange your furniture with others',
      image: '/swap-pic.png',
      link: undefined,
      isActive: true,
      order: 3,
      isFallback: true
    }
  ];

  // Carousel state
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [carouselForm, setCarouselForm] = useState({
    title: '',
    description: '',
    image: '',
    link: ''
  });
  const [carouselImageFile, setCarouselImageFile] = useState<File | null>(null);
  const [carouselImagePreview, setCarouselImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Combine database slides with fallback slides
  const allCarouselSlides = [...carouselSlides, ...fallbackCarouselSlides];

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error' | 'advertisement' | 'discount' | 'sale',
    startDate: '',
    endDate: '',
    image: '',
    link: ''
  });

  // Image upload states for announcements
  const [announcementImageFile, setAnnouncementImageFile] = useState<File | null>(null);
  const [announcementImagePreview, setAnnouncementImagePreview] = useState<string>('');

  // Flash sale state
  const [flashSaleSettings, setFlashSaleSettings] = useState<FlashSaleSettings | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);
  const [flashSaleForm, setFlashSaleForm] = useState({
    isActive: false,
    discountPercentage: 20,
    startDate: '',
    endDate: '',
    featuredProducts: [] as string[],
    title: 'Flash Sale',
    description: ''
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Fetch data functions
  const fetchCarouselSlides = async () => {
    try {
      console.log('Fetching carousel slides with token:', token ? 'present' : 'missing');
      
      // Try admin endpoint first
      let response = await fetch(`${API_BASE_URL}/api/content/admin/carousel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // If unauthorized, fallback to public endpoint
      if (response.status === 401) {
        console.log('Admin endpoint unauthorized, trying public endpoint');
        response = await fetch(`${API_BASE_URL}/api/content/carousel`);
      }
      
      const data = await response.json();
      console.log('Carousel slides response:', data);
      setCarouselSlides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
      setCarouselSlides([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      console.log('Fetching announcements with token:', token ? 'present' : 'missing');
      
      // Try admin endpoint first
      let response = await fetch(`${API_BASE_URL}/api/content/admin/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // If unauthorized, fallback to public endpoint
      if (response.status === 401) {
        console.log('Admin endpoint unauthorized, trying public endpoint');
        response = await fetch(`${API_BASE_URL}/api/content/announcements`);
      }
      
      const data = await response.json();
      console.log('Announcements response:', data);
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    }
  };

  const fetchFlashSaleSettings = async () => {
    try {
      console.log('Fetching flash sale settings with token:', token ? 'present' : 'missing');
      
      // Try admin endpoint first
      let response = await fetch(`${API_BASE_URL}/api/content/admin/flash-sale`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // If unauthorized, fallback to public endpoint
      if (response.status === 401) {
        console.log('Admin endpoint unauthorized, trying public endpoint');
        response = await fetch(`${API_BASE_URL}/api/content/flash-sale`);
      }
      
      const data = await response.json();
      console.log('Flash sale settings response:', data);
      console.log('Featured products:', data?.featuredProducts);
      setFlashSaleSettings(data);
      setFlashSaleForm({
        isActive: data?.isActive || false,
        discountPercentage: data?.discountPercentage || 20,
        startDate: data?.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
        endDate: data?.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
        featuredProducts: data?.featuredProducts?.map((p: any) => p._id) || [],
        title: data?.title || 'Flash Sale',
        description: data?.description || ''
      });
    } catch (error) {
      console.error('Error fetching flash sale settings:', error);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available products:', error);
      setAvailableProducts([]);
    }
  };

  useEffect(() => {
    // Check if user is admin
    console.log('Content Management: Auth state', { 
      user: user?.email, 
      role: user?.role, 
      authIsAdmin, 
      isAuthenticated,
      hasToken: !!token 
    });
    
    if (user && authIsAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user, authIsAdmin, isAuthenticated, token]);

  useEffect(() => {
    if (token && isAdmin) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchCarouselSlides(),
            fetchAnnouncements(),
            fetchFlashSaleSettings(),
            fetchAvailableProducts()
          ]);
        } catch (error) {
          console.error('Error loading content management data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    } else if (!isAdmin && user) {
      // User is logged in but not admin
      console.log('User is not admin, skipping data fetch');
      setIsLoading(false);
    }
  }, [token, isAdmin, user]);

  // Carousel handlers
  const handleCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSlide 
        ? `${API_BASE_URL}/api/content/admin/carousel/${editingSlide._id}`
        : `${API_BASE_URL}/api/content/admin/carousel`;
      
      const method = editingSlide ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(carouselForm)
      });

      if (response.ok) {
        setShowCarouselModal(false);
        setEditingSlide(null);
        setCarouselForm({ title: '', description: '', image: '', link: '' });
        fetchCarouselSlides();
      }
    } catch (error) {
      console.error('Error saving carousel slide:', error);
    }
  };

  const handleEditCarousel = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setCarouselForm({
      title: slide.title,
      description: slide.description || '',
      image: slide.image,
      link: slide.link || ''
    });
    setCarouselImagePreview(slide.image);
    setCarouselImageFile(null);
    setIsUploading(false);
    setShowCarouselModal(true);
  };

  const handleDeleteCarousel = async (id: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      try {
        await fetch(`${API_BASE_URL}/api/content/admin/carousel/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchCarouselSlides();
      } catch (error) {
        console.error('Error deleting carousel slide:', error);
      }
    }
  };

  // Announcement handlers
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAnnouncement 
        ? `${API_BASE_URL}/api/content/admin/announcements/${editingAnnouncement._id}`
        : `${API_BASE_URL}/api/content/admin/announcements`;
      
      const method = editingAnnouncement ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(announcementForm)
      });

      if (response.ok) {
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({ title: '', message: '', type: 'info', startDate: '', endDate: '', image: '', link: '' });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().slice(0, 16) : '',
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : '',
      image: announcement.image || '',
      link: announcement.link || ''
    });
    setAnnouncementImagePreview(announcement.image || '');
    setShowAnnouncementModal(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await fetch(`${API_BASE_URL}/api/content/admin/announcements/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarouselImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCarouselImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image upload handler for announcements
  const handleAnnouncementImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnnouncementImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAnnouncementImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/api/products/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  const handleSaveCarousel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin || !token) {
      alert('You must be logged in as an admin to perform this action');
      return;
    }
    
    // Validate required fields
    if (!carouselForm.title.trim()) {
      alert('Please enter a title for the carousel slide');
      return;
    }
    
    if (!carouselForm.image && !carouselImageFile) {
      alert('Please select an image for the carousel slide');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      let imageUrl = carouselForm.image;
      
      // Upload new image if file is selected
      if (carouselImageFile) {
        setUploadProgress(25);
        imageUrl = await uploadImageToServer(carouselImageFile);
        setUploadProgress(75);
      }
      
      const formData = {
        ...carouselForm,
        image: imageUrl,
        order: editingSlide ? editingSlide.order : allCarouselSlides.length + 1
      };
      
      const url = editingSlide 
        ? `${API_BASE_URL}/api/content/admin/carousel/${editingSlide._id}`
        : `${API_BASE_URL}/api/content/admin/carousel`;
      
      const method = editingSlide ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      setUploadProgress(100);
      
      if (response.ok) {
        setShowCarouselModal(false);
        setEditingSlide(null);
        setCarouselForm({ title: '', description: '', image: '', link: '' });
        setCarouselImageFile(null);
        setCarouselImagePreview('');
        fetchCarouselSlides();
      } else {
        const errorData = await response.json();
        alert(`Error saving carousel slide: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving carousel slide:', error);
      alert(`Error saving carousel slide: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    try {
      let imageUrl = announcementForm.image;
      
      // Upload new image if file is selected
      if (announcementImageFile) {
        setIsUploading(true);
        setUploadProgress(25);
        imageUrl = await uploadImageToServer(announcementImageFile);
        setUploadProgress(75);
      }
      
      const formData = {
        ...announcementForm,
        image: imageUrl
      };
      
      const url = editingAnnouncement 
        ? `${API_BASE_URL}/api/content/admin/announcements/${editingAnnouncement._id}`
        : `${API_BASE_URL}/api/content/admin/announcements`;
      
      const method = editingAnnouncement ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({ title: '', message: '', type: 'info', startDate: '', endDate: '', image: '', link: '' });
        setAnnouncementImageFile(null);
        setAnnouncementImagePreview('');
        setIsUploading(false);
        setUploadProgress(0);
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Flash sale handlers
  const handleFlashSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/admin/flash-sale`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flashSaleForm)
      });

      if (response.ok) {
        setShowFlashSaleModal(false);
        fetchFlashSaleSettings();
      }
    } catch (error) {
      console.error('Error saving flash sale settings:', error);
    }
  };

  const handleEditFlashSale = () => {
    if (flashSaleSettings) {
      setFlashSaleForm({
        isActive: flashSaleSettings.isActive,
        discountPercentage: flashSaleSettings.discountPercentage,
        startDate: flashSaleSettings.startDate ? new Date(flashSaleSettings.startDate).toISOString().slice(0, 16) : '',
        endDate: flashSaleSettings.endDate ? new Date(flashSaleSettings.endDate).toISOString().slice(0, 16) : '',
        featuredProducts: flashSaleSettings.featuredProducts?.map(p => p._id) || [],
        title: flashSaleSettings.title,
        description: flashSaleSettings.description || ''
      });
    }
    setShowFlashSaleModal(true);
  };

  return (
    <div className={`${montserrat.className} flex min-h-screen bg-gray-50`}>
      <AdminSidebar activePage="content-management" />
      
      {/* Main Content */}
      <div className="flex-1 ml-80 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Package className="w-5 h-5 text-gray-600 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">Content Management</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Manage Site Content</h2>
          </div>

          {!isAdmin && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Read-Only Mode
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You are viewing content in read-only mode. Admin privileges are required to modify content.</p>
                    <p className="mt-1 font-medium">
                      Current status: {user ? `Logged in as ${user.email} (${user.role})` : 'Not logged in'}
                    </p>
                    <p className="mt-1 text-xs">
                      Auth status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'} | 
                      Admin check: {authIsAdmin ? 'Admin' : 'Not admin'} | 
                      Token: {token ? 'Present' : 'Missing'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('carousel')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'carousel'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Carousel
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('flashsale')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'flashsale'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Percent className="w-4 h-4 inline mr-2" />
              Flash Sale
            </button>
          </div>

          {/* Carousel Tab */}
          {activeTab === 'carousel' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hero Carousel Slides</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage the carousel slides displayed on your shop and landing pages</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                      showPreview 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingSlide(null);
                      setCarouselForm({ title: '', description: '', image: '', link: '' });
                      setCarouselImageFile(null);
                      setCarouselImagePreview('');
                      setIsUploading(false);
                      setUploadProgress(0);
                      setShowCarouselModal(true);
                    }}
                    disabled={!isAdmin}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                      isAdmin 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Slide</span>
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">Live Shop Preview</h4>
                        <p className="text-xs text-gray-500">See how your carousel appears to customers</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open('/shop', '_blank')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1 text-xs font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Shop</span>
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  
                  {/* Carousel Preview */}
                  <div className="relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200">
                      {/* Mini carousel representation */}
                      <div className="flex h-full">
                        {allCarouselSlides.slice(0, 3).map((slide, index) => (
                          <div key={slide._id} className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-6 h-6 bg-gray-400 rounded-full mx-auto mb-1"></div>
                                <p className="text-xs text-gray-600 font-medium">{slide.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{slide.description}</p>
                              </div>
                            </div>
                            {index === 0 && (
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border border-blue-300 rounded-lg"></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Navigation dots */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {allCarouselSlides.map((_, index) => (
                          <div
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              index === 0 ? 'bg-blue-600' : 'bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Current slide indicator */}
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Slide 1 of {allCarouselSlides.length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistics */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900">{allCarouselSlides.length}</div>
                      <div className="text-xs text-gray-600">Total Slides</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900">{allCarouselSlides.filter(s => s.isActive).length}</div>
                      <div className="text-xs text-gray-600">Active Slides</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900">{allCarouselSlides.filter(s => s.isFallback).length}</div>
                      <div className="text-xs text-gray-600">Fallback Slides</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 text-center">
                      Click "Open Shop" to see the actual carousel in action
                    </p>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading carousel slides...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {allCarouselSlides.map((slide) => (
                    <div key={slide._id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md ${
                      slide.isFallback ? 'border-yellow-200 bg-yellow-50' : 'hover:border-gray-200'
                    }`}>
                      <div className="relative h-32 bg-gray-100">
                        <img 
                          src={slide.image} 
                          alt={slide.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                        {slide.isFallback && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Fallback
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          Order: {slide.order}
                        </div>
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                          slide.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">{slide.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{slide.description}</p>
                        
                        {slide.link && (
                          <div className="mb-3">
                            <a 
                              href={slide.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview Link
                            </a>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          {isAdmin && !slide.isFallback ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditCarousel(slide)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1 text-sm font-medium"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCarousel(slide._id)}
                                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-1 text-sm font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {slide.isFallback ? 'System fallback slide' : 'No actions available'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {allCarouselSlides.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">No carousel slides found</h3>
                      <p className="text-sm text-gray-600 mb-4">Add your first slide to get started with the carousel.</p>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingSlide(null);
                            setCarouselForm({ title: '', description: '', image: '', link: '' });
                            setCarouselImageFile(null);
                            setCarouselImagePreview('');
                            setIsUploading(false);
                            setShowCarouselModal(true);
                          }}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Add Your First Slide
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-gray-900">Site Announcements</h3>
                <button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({ title: '', message: '', type: 'info', startDate: '', endDate: '', image: '', link: '' });
                    setShowAnnouncementModal(true);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Announcement
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading announcements...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                  <div key={announcement._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Image for advertisement, discount, sale types */}
                        {announcement.image && ['advertisement', 'discount', 'sale'].includes(announcement.type) && (
                          <div className="mb-4">
                            <img 
                              src={announcement.image} 
                              alt={announcement.title}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                            announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                            announcement.type === 'error' ? 'bg-red-100 text-red-800' :
                            announcement.type === 'advertisement' ? 'bg-purple-100 text-purple-800' :
                            announcement.type === 'discount' ? 'bg-orange-100 text-orange-800' :
                            announcement.type === 'sale' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {announcement.type}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {announcement.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                        
                        {/* Link for advertisement, discount, sale types */}
                        {announcement.link && ['advertisement', 'discount', 'sale'].includes(announcement.type) && (
                          <div className="mb-2">
                            <a
                              href={announcement.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              {announcement.link}
                            </a>
                          </div>
                        )}
                        
                        {(announcement.startDate || announcement.endDate) && (
                          <div className="text-xs text-gray-500">
                            {announcement.startDate && `From: ${new Date(announcement.startDate).toLocaleDateString()}`}
                            {announcement.startDate && announcement.endDate && ' • '}
                            {announcement.endDate && `To: ${new Date(announcement.endDate).toLocaleDateString()}`}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditAnnouncement(announcement)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No announcements found. Add your first announcement to get started.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Flash Sale Tab */}
          {activeTab === 'flashsale' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-gray-900">Flash Sale Settings</h3>
                <button
                  onClick={handleEditFlashSale}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Settings
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading flash sale settings...</p>
                </div>
              ) : flashSaleSettings ? (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                        flashSaleSettings?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {flashSaleSettings?.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Discount</label>
                      <div className="text-lg font-semibold text-gray-900">{flashSaleSettings?.discountPercentage || 0}%</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <div className="text-gray-900">{flashSaleSettings?.title || 'No title'}</div>
                  </div>
                  {flashSaleSettings?.description && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <div className="text-gray-900">{flashSaleSettings.description}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <div className="text-gray-900">{flashSaleSettings?.startDate ? new Date(flashSaleSettings.startDate).toLocaleString() : 'Not set'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <div className="text-gray-900">{flashSaleSettings?.endDate ? new Date(flashSaleSettings.endDate).toLocaleString() : 'Not set'}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Featured Products ({flashSaleSettings.featuredProducts?.length || 0})</label>
                    <div className="mt-2 space-y-2">
                      {flashSaleSettings.featuredProducts?.map((product) => (
                        <div key={product._id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <img src={product.images[0]} alt={product.title} className="w-8 h-8 object-cover rounded mr-3" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-xs text-gray-600">₱{product.price.toLocaleString()}</div>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Percent className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No flash sale settings found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Carousel Modal */}
      {showCarouselModal && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCarouselModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSlide ? 'Edit Carousel Slide' : 'Add Carousel Slide'}
              </h3>
              <button
                onClick={() => setShowCarouselModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCarousel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={carouselForm.title}
                  onChange={(e) => setCarouselForm({ ...carouselForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={carouselForm.description}
                  onChange={(e) => setCarouselForm({ ...carouselForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {carouselImagePreview && (
                    <div className="relative">
                      <img 
                        src={carouselImagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCarouselImagePreview('');
                          setCarouselImageFile(null);
                          setCarouselForm({ ...carouselForm, image: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  
                  {/* Manual URL Input (fallback) */}
                  <div className="text-center text-xs text-gray-500">or</div>
                  <input
                    type="url"
                    placeholder="Enter image URL manually"
                    value={carouselForm.image}
                    onChange={(e) => {
                      setCarouselForm({ ...carouselForm, image: e.target.value });
                      if (e.target.value && !carouselImageFile) {
                        setCarouselImagePreview(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
                <input
                  type="url"
                  value={carouselForm.link}
                  onChange={(e) => setCarouselForm({ ...carouselForm, link: e.target.value })}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCarouselModal(false)}
                  className="px-4 py-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isUploading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading... {uploadProgress}%</span>
                    </>
                  ) : (
                    <span>{editingSlide ? 'Update' : 'Add'} Slide</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnnouncementModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}
              </h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAnnouncement} className="space-y-3">
              {/* Basic Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={announcementForm.type}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="discount">Discount</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
              </div>
              
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  required
                />
              </div>
              
              {/* Image Section - Compact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="space-y-2">
                  {/* Image Preview - Smaller */}
                  {announcementImagePreview && (
                    <div className="relative">
                      <img 
                        src={announcementImagePreview} 
                        alt="Preview" 
                        className="w-full h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAnnouncementImagePreview('');
                          setAnnouncementImageFile(null);
                          setAnnouncementForm({ ...announcementForm, image: '' });
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* Compact Upload Area */}
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Upload Image</span>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAnnouncementImageUpload}
                      />
                    </label>
                    <span className="text-xs text-gray-400">or</span>
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={announcementForm.image}
                      onChange={(e) => {
                        setAnnouncementForm({ ...announcementForm, image: e.target.value });
                        if (e.target.value && !announcementImageFile) {
                          setAnnouncementImagePreview(e.target.value);
                        }
                      }}
                      className="flex-1 px-2 py-2 text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Link and Dates Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={announcementForm.link}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="date"
                      value={announcementForm.startDate ? announcementForm.startDate.split('T')[0] : ''}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, startDate: e.target.value + 'T00:00' })}
                      className="px-2 py-2 text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={announcementForm.endDate ? announcementForm.endDate.split('T')[0] : ''}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, endDate: e.target.value + 'T23:59' })}
                      className="px-2 py-2 text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isUploading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading... {uploadProgress}%</span>
                    </>
                  ) : (
                    <span>{editingAnnouncement ? 'Update' : 'Add'} Announcement</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flash Sale Modal */}
      {showFlashSaleModal && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFlashSaleModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Flash Sale Settings</h3>
              <button
                onClick={() => setShowFlashSaleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFlashSaleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={flashSaleForm.title}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={flashSaleForm.discountPercentage}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, discountPercentage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={flashSaleForm.description}
                  onChange={(e) => setFlashSaleForm({ ...flashSaleForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={flashSaleForm.startDate}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={flashSaleForm.endDate}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Products</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {availableProducts.map((product) => (
                    <label key={product._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={flashSaleForm.featuredProducts.includes(product._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFlashSaleForm({
                              ...flashSaleForm,
                              featuredProducts: [...flashSaleForm.featuredProducts, product._id]
                            });
                          } else {
                            setFlashSaleForm({
                              ...flashSaleForm,
                              featuredProducts: flashSaleForm.featuredProducts.filter(id => id !== product._id)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{product.title} - ${product.price}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={flashSaleForm.isActive}
                  onChange={(e) => setFlashSaleForm({ ...flashSaleForm, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Activate Flash Sale
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFlashSaleModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagementPage;
