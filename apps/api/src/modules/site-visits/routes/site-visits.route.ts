import { Router } from "express";
import {
  trackVisit,
  getTotalVisits,
  getVisits,
} from "../controllers/site-visits.controller";
import authMiddleware from "../../../middleware/auth";
import adminAuth from "../../../middleware/adminAuth";

const siteVisitRoutes = Router();

// Track a visit (public endpoint)
siteVisitRoutes.post("/track", trackVisit);

// Get total visits count (admin only)
siteVisitRoutes.get("/total", authMiddleware, adminAuth, getTotalVisits);

// Get visits with pagination (admin only)
siteVisitRoutes.get("/", authMiddleware, adminAuth, getVisits);

export default siteVisitRoutes;
