"use client";
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

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

interface AnnouncementModalProps {
  announcements: Announcement[];
  onClose: () => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ announcements, onClose }) => {
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const currentAnnouncement = announcements[currentAnnouncementIndex];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'advertisement':
        return <Info className="w-6 h-6 text-purple-600" />;
      case 'discount':
        return <Info className="w-6 h-6 text-orange-600" />;
      case 'sale':
        return <Info className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'advertisement':
        return 'bg-purple-50 border-purple-200';
      case 'discount':
        return 'bg-orange-50 border-orange-200';
      case 'sale':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'advertisement':
        return 'text-purple-800';
      case 'discount':
        return 'text-orange-800';
      case 'sale':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  const handleNext = () => {
    if (currentAnnouncementIndex < announcements.length - 1) {
      setCurrentAnnouncementIndex(currentAnnouncementIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentAnnouncementIndex > 0) {
      setCurrentAnnouncementIndex(currentAnnouncementIndex - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!currentAnnouncement) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${getBackgroundColor(currentAnnouncement.type)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon(currentAnnouncement.type)}
              <h2 className={`text-lg font-semibold ${getTextColor(currentAnnouncement.type)}`}>
                {currentAnnouncement.title}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image for advertisement, discount, sale types */}
          {currentAnnouncement.image && ['advertisement', 'discount', 'sale'].includes(currentAnnouncement.type) && (
            <div className="mb-6">
              <img 
                src={currentAnnouncement.image} 
                alt={currentAnnouncement.title}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
          
          <p className="text-gray-700 leading-relaxed mb-6">
            {currentAnnouncement.message}
          </p>

          {/* Link button for advertisement, discount, sale types */}
          {currentAnnouncement.link && ['advertisement', 'discount', 'sale'].includes(currentAnnouncement.type) && (
            <div className="mb-6">
              <a
                href={currentAnnouncement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Learn More
              </a>
            </div>
          )}

          {/* Pagination */}
          {announcements.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                {announcements.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentAnnouncementIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {currentAnnouncementIndex + 1} of {announcements.length}
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentAnnouncementIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentAnnouncementIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {currentAnnouncementIndex === announcements.length - 1 ? 'Close' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
