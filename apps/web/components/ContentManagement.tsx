"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Calendar, Percent, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CarouselSlide {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
}

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
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

const ContentManagement: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'carousel' | 'announcements' | 'flashsale'>('carousel');
  
  // Carousel state
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [carouselForm, setCarouselForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    order: 0
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    startDate: '',
    endDate: ''
  });

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
      const response = await fetch(`${API_BASE_URL}/api/content/admin/carousel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCarouselSlides(data);
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/admin/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchFlashSaleSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/admin/flash-sale`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFlashSaleSettings(data);
      setFlashSaleForm({
        isActive: data.isActive,
        discountPercentage: data.discountPercentage,
        startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
        featuredProducts: data.featuredProducts?.map((p: any) => p._id) || [],
        title: data.title,
        description: data.description || ''
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
      setAvailableProducts(data);
    } catch (error) {
      console.error('Error fetching available products:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCarouselSlides();
      fetchAnnouncements();
      fetchFlashSaleSettings();
      fetchAvailableProducts();
    }
  }, [token]);

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
        setCarouselForm({ title: '', description: '', image: '', link: '', order: 0 });
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
      link: slide.link || '',
      order: slide.order
    });
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
        setAnnouncementForm({ title: '', message: '', type: 'info', startDate: '', endDate: '' });
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
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : ''
    });
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Content Management</h2>
      </div>

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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-900">Hero Carousel Slides</h3>
            <button
              onClick={() => {
                setEditingSlide(null);
                setCarouselForm({ title: '', description: '', image: '', link: '', order: 0 });
                setShowCarouselModal(true);
              }}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Slide
            </button>
          </div>

          <div className="space-y-4">
            {carouselSlides.map((slide) => (
              <div key={slide._id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                <img src={slide.image} alt={slide.title} className="w-16 h-16 object-cover rounded-lg mr-4" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{slide.title}</h4>
                  <p className="text-sm text-gray-600">{slide.description}</p>
                  <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                    <span>Order: {slide.order}</span>
                    <span className={`px-2 py-1 rounded-full ${slide.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCarousel(slide)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCarousel(slide._id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                setAnnouncementForm({ title: '', message: '', type: 'info', startDate: '', endDate: '' });
                setShowAnnouncementModal(true);
              }}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Announcement
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                        announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {announcement.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
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
          </div>
        </div>
      )}

      {/* Flash Sale Tab */}
      {activeTab === 'flashsale' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-900">Flash Sale Settings</h3>
            <button
              onClick={() => setShowFlashSaleModal(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Settings
            </button>
          </div>

          {flashSaleSettings && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                    flashSaleSettings.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {flashSaleSettings.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Discount</label>
                  <div className="text-lg font-semibold text-gray-900">{flashSaleSettings.discountPercentage}%</div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <div className="text-gray-900">{flashSaleSettings.title}</div>
              </div>
              {flashSaleSettings.description && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <div className="text-gray-900">{flashSaleSettings.description}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <div className="text-gray-900">{new Date(flashSaleSettings.startDate).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <div className="text-gray-900">{new Date(flashSaleSettings.endDate).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Featured Products ({flashSaleSettings.featuredProducts.length})</label>
                <div className="mt-2 space-y-2">
                  {flashSaleSettings.featuredProducts.map((product) => (
                    <div key={product._id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <img src={product.images[0]} alt={product.title} className="w-8 h-8 object-cover rounded mr-3" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        <div className="text-xs text-gray-600">₱{product.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals would go here - keeping component focused for now */}
    </div>
  );
};

export default ContentManagement;
