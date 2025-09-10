import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller";
import authMiddleware from "../../../middleware/auth";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/profile");

export default userRoutes;
