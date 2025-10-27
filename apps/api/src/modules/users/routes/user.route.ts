import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getUserProfileByEmail,
  updateProfile,
  googleAuth,
  createAdmin,
  listUsers,
  adminUpdateUser,
  adminDeleteUser,
  uploadProfilePicture,
  lookupUserByEmail,
  updateUserActivity,
  getActiveUsers,
  getActiveUsersForMessaging,
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowers,
  getFollowing,
  updatePrivacySettings,
  sendOTP,
  verifyOTP,
  checkLastLogin,
  getCurrentOTP,
} from "../controllers/user.controller";
import authMiddleware from "../../../middleware/auth";
import adminAuth from "../../../middleware/adminAuth";
import multer from "multer";

const userRoutes = Router();
const upload = multer({ dest: "uploads/" });

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/google-auth", googleAuth);
userRoutes.post("/create-admin", createAdmin);
userRoutes.get("/profile", authMiddleware, getProfile);
userRoutes.get("/profile/:email", getUserProfileByEmail);
userRoutes.put("/profile", authMiddleware, updateProfile);
userRoutes.post("/profile/avatar", authMiddleware, upload.single('avatar'), uploadProfilePicture);
// Lookup user by email (for starting conversations)
userRoutes.get('/lookup', authMiddleware, lookupUserByEmail);

// Update user activity
userRoutes.post('/activity', authMiddleware, updateUserActivity);

// Get active users for messaging (regular users)
userRoutes.get('/active', authMiddleware, getActiveUsersForMessaging);

// Admin-only list users
userRoutes.get("/", authMiddleware, adminAuth, listUsers);

// Admin-only get active users (admin endpoint)
userRoutes.get("/admin/active", authMiddleware, adminAuth, getActiveUsers);

// Follow/Unfollow functionality (must be before /:id routes)
userRoutes.post("/follow/:userId", authMiddleware, followUser);
userRoutes.delete("/follow/:userId", authMiddleware, unfollowUser);
userRoutes.get("/follow-status/:userId", authMiddleware, checkFollowStatus);
userRoutes.get("/followers/:userId", authMiddleware, getFollowers);
userRoutes.get("/following/:userId", authMiddleware, getFollowing);
userRoutes.put("/privacy-settings", authMiddleware, updatePrivacySettings);

// OTP routes
userRoutes.post("/send-otp", sendOTP);
userRoutes.post("/verify-otp", verifyOTP);
userRoutes.get("/check-last-login/:email", checkLastLogin);
userRoutes.get("/current-otp/:email", getCurrentOTP);

// Admin: update user
userRoutes.put("/:id", authMiddleware, adminAuth, adminUpdateUser);

// Admin: delete user (requires admin password)
userRoutes.delete("/:id", authMiddleware, adminAuth, adminDeleteUser);

export default userRoutes;
