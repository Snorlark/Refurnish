import { useState, useEffect } from 'react';

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

export const useContent = () => {
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [flashSaleSettings, setFlashSaleSettings] = useState<FlashSaleSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all content in parallel
      const [carouselResponse, announcementsResponse, flashSaleResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/content/carousel`),
        fetch(`${API_BASE_URL}/api/content/announcements`),
        fetch(`${API_BASE_URL}/api/content/flash-sale`)
      ]);

      const [carouselData, announcementsData, flashSaleData] = await Promise.all([
        carouselResponse.json(),
        announcementsResponse.json(),
        flashSaleResponse.json()
      ]);

      setCarouselSlides(Array.isArray(carouselData) ? carouselData : []);
      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      setFlashSaleSettings(flashSaleData);
    } catch (error) {
      console.error('Error fetching content:', error);
      // Set fallback values
      setCarouselSlides([]);
      setAnnouncements([]);
      setFlashSaleSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    carouselSlides,
    announcements,
    flashSaleSettings,
    isLoading,
    refetch: fetchContent
  };
};
