import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  googleAuth,
  createAdmin,
  listUsers,
} from "../controllers/user.controller";
import authMiddleware from "../../../middleware/auth";
import adminAuth from "../../../middleware/adminAuth";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/google-auth", googleAuth);
userRoutes.post("/create-admin", createAdmin);
userRoutes.get("/profile", authMiddleware, getProfile);
// Admin-only list users
userRoutes.get("/", authMiddleware, adminAuth, listUsers);

export default userRoutes;
