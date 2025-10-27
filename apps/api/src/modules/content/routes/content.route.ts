import { Router } from "express";
import {
  getCarouselSlides,
  getAllCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getFlashSaleSettings,
  updateFlashSaleSettings,
  getAvailableProducts
} from "../controllers/content.controller";
import authMiddleware from "../../../middleware/auth";
import adminAuth from "../../../middleware/adminAuth";

const contentRoutes = Router();

// Public routes (for frontend display)
contentRoutes.get("/carousel", getCarouselSlides);
contentRoutes.get("/announcements", getAnnouncements);
contentRoutes.get("/flash-sale", getFlashSaleSettings);

// Admin routes (require authentication + admin role)
contentRoutes.get("/admin/carousel", authMiddleware, adminAuth, getAllCarouselSlides);
contentRoutes.post("/admin/carousel", authMiddleware, adminAuth, createCarouselSlide);
contentRoutes.put("/admin/carousel/:id", authMiddleware, adminAuth, updateCarouselSlide);
contentRoutes.delete("/admin/carousel/:id", authMiddleware, adminAuth, deleteCarouselSlide);

contentRoutes.get("/admin/announcements", authMiddleware, adminAuth, getAllAnnouncements);
contentRoutes.post("/admin/announcements", authMiddleware, adminAuth, createAnnouncement);
contentRoutes.put("/admin/announcements/:id", authMiddleware, adminAuth, updateAnnouncement);
contentRoutes.delete("/admin/announcements/:id", authMiddleware, adminAuth, deleteAnnouncement);

contentRoutes.get("/admin/flash-sale", authMiddleware, adminAuth, getFlashSaleSettings);
contentRoutes.put("/admin/flash-sale", authMiddleware, adminAuth, updateFlashSaleSettings);
contentRoutes.get("/admin/products", authMiddleware, adminAuth, getAvailableProducts);

export default contentRoutes;
