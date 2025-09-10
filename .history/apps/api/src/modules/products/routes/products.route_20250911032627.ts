import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/user.controller";
import authMiddleware from "../../../middleware/auth";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/profile", authMiddleware, getProfile);

export default userRoutes;
