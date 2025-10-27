import { Router } from "express";
import { getNotifications } from "../controllers/notifications.controller";
import { 
  getRecentActivities, 
  getTopSellingProducts, 
  getUserAnalytics, 
  getRevenueAnalytics,
  getSystemSettings,
  updateSystemSettings
} from "../controllers/analytics.controller";
import authMiddleware from "../../../middleware/auth";
import adminAuth from "../../../middleware/adminAuth";

const adminRoutes = Router();

// Admin notification routes
adminRoutes.get("/notifications", authMiddleware, adminAuth, getNotifications);

// Admin analytics routes
adminRoutes.get("/analytics/recent-activities", authMiddleware, adminAuth, getRecentActivities);
adminRoutes.get("/analytics/top-selling-products", authMiddleware, adminAuth, getTopSellingProducts);
adminRoutes.get("/analytics/user-analytics", authMiddleware, adminAuth, getUserAnalytics);
adminRoutes.get("/analytics/revenue-analytics", authMiddleware, adminAuth, getRevenueAnalytics);

// System settings routes
adminRoutes.get("/system-settings", authMiddleware, adminAuth, getSystemSettings);
adminRoutes.put("/system-settings", authMiddleware, adminAuth, updateSystemSettings);

export default adminRoutes;
