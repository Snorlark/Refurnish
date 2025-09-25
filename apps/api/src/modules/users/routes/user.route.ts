import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  googleAuth,
  createAdmin,
  listUsers,
  adminUpdateUser,
  adminDeleteUser,
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

// Admin: update user
userRoutes.put("/:id", authMiddleware, adminAuth, adminUpdateUser);

// Admin: delete user (requires admin password)
userRoutes.delete("/:id", authMiddleware, adminAuth, adminDeleteUser);

export default userRoutes;
