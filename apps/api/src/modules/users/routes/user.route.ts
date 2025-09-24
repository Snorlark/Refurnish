import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  googleAuth,
  createAdmin,
} from "../controllers/user.controller";
import authMiddleware from "../../../middleware/auth";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/google-auth", googleAuth);
userRoutes.post("/create-admin", createAdmin);
userRoutes.get("/profile", authMiddleware, getProfile);

export default userRoutes;
