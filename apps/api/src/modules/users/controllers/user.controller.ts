import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { io } from "../../../app";
import config from "../../../config/config";
import cloudinary from "cloudinary";
import { createOTP, verifyOTP as verifyOTPService, checkOTPAttempts } from "../../../services/otpService";

// Validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long" };
  }
  return { isValid: true };
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const user = new User({ firstName, lastName, email, password, role: 'buyer' });
    await user.save();
    const token = user.generateAuthToken();
    
    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: "User registered successfully!" 
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, adminSecret } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      return res.status(400).json({ error: "Please use Google sign-in for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Admin authentication check
    if (user.role === 'admin') {
      if (!adminSecret || adminSecret !== config.adminSecret) {
        return res.status(403).json({ error: "Admin access denied" });
      }
    }

    const token = user.generateAuthToken();
    res.json({ 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: "Logged in successfully!" 
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    console.log('Google Auth request received:', req.body);
    const { googleId, email, firstName, lastName, profilePicture } = req.body;

    // More lenient validation - only require googleId and email
    if (!googleId || !email) {
      console.log('Google Auth: Missing required fields', { googleId, email, firstName, lastName });
      return res.status(400).json({ error: "Google authentication data incomplete" });
    }

    // Use email as fallback for names if not provided
    const finalFirstName = firstName || email.split('@')[0];
    const finalLastName = lastName || '';

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });
    console.log('Google Auth: User found by googleId:', !!user);
    
    if (!user) {
      // Check if user exists with email but no Google ID
      user = await User.findOne({ email });
      console.log('Google Auth: User found by email:', !!user);
      
      if (user) {
        // Link Google account to existing user
        console.log('Google Auth: Linking Google account to existing user');
        user.googleId = googleId;
        // Only update profile picture if user doesn't have a custom one
        if (!user.profilePicture || user.profilePicture.includes('googleusercontent.com')) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      } else {
        // Create new user
        console.log('Google Auth: Creating new user');
        user = new User({
          googleId,
          email,
          firstName: finalFirstName,
          lastName: finalLastName,
          profilePicture,
          isEmailVerified: true,
          role: 'buyer'
        });
        await user.save();
        console.log('Google Auth: New user created:', user._id);
      }
    } else {
      // Update existing user's profile picture only if they don't have a custom one
      if (!user.profilePicture || user.profilePicture.includes('googleusercontent.com')) {
        console.log('Google Auth: Updating profile picture for existing user');
        user.profilePicture = profilePicture;
        await user.save();
      }
    }

    const token = user.generateAuthToken();
    const responseData = { 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      },
      message: "Google authentication successful!" 
    };
    
    console.log('Google Auth: Sending response:', responseData);
    res.json(responseData);
  } catch (err: any) {
    console.error('Google Auth error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, adminSecret } = req.body;

    // Check admin secret
    if (!adminSecret || adminSecret !== config.adminSecret) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const user = new User({ firstName, lastName, email, password, role: 'admin' });
    await user.save();
    const token = user.generateAuthToken();
    
    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: "Admin created successfully!" 
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // The 'authMiddleware' has already attached the user's ID to the request object.
    const { _id: userId } = req.user;

    // Find the user by ID and exclude the password field for security.
    const user = await User.findById(userId).select("-password");

    // If the user is not found, return a 404 error.
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user's profile data in the response.
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      contactNumber: (user as any).contactNumber,
      address: (user as any).address,
      birthday: (user as any).birthday,
      gender: (user as any).gender
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfileByEmail = async (req: Request, res: Response) => {
  try {
    let { email } = req.params;

    console.log('Original email param:', email);

    // Decode URL-encoded email if needed
    if (email.includes('%40')) {
      email = decodeURIComponent(email);
    }
    console.log('Processed email:', email);

    // Try to find user by exact email match first
    let user = await User.findOne({ email }).select("-password");
    console.log('Exact match result:', user ? 'Found' : 'Not found');

    // If not found, try to find by email with @gmail.com appended
    if (!user && !email.includes('@')) {
      const emailWithGmail = `${email}@gmail.com`;
      console.log('Trying with @gmail.com:', emailWithGmail);
      user = await User.findOne({ email: emailWithGmail }).select("-password");
      console.log('With @gmail.com result:', user ? 'Found' : 'Not found');
    }

    // If still not found, try to find by email without @gmail.com
    if (!user && email.includes('@gmail.com')) {
      const emailWithoutDomain = email.replace('@gmail.com', '');
      console.log('Trying without @gmail.com:', emailWithoutDomain);
      user = await User.findOne({ email: emailWithoutDomain }).select("-password");
      console.log('Without @gmail.com result:', user ? 'Found' : 'Not found');
    }

    // If the user is not found, return a 404 error.
    if (!user) {
      console.log('User not found after all attempts');
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user's profile data in the response.
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      contactNumber: (user as any).contactNumber,
      address: (user as any).address,
      birthday: (user as any).birthday,
      gender: (user as any).gender,
      createdAt: (user as any).createdAt,
      followerCount: (user as any).followerCount || 0,
      followingCount: (user as any).followingCount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.user;
    const { firstName, lastName, profilePicture, contactNumber, address, birthday, gender } = req.body as {
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
      contactNumber?: string;
      address?: string;
      birthday?: string;
      gender?: 'male' | 'female' | 'other';
    };

    const updates: any = {};
    if (typeof firstName === 'string') updates.firstName = firstName;
    if (typeof lastName === 'string') updates.lastName = lastName;
    if (typeof profilePicture === 'string') updates.profilePicture = profilePicture;
    if (typeof contactNumber === 'string') updates.contactNumber = contactNumber;
    if (typeof address === 'string') updates.address = address;
    if (typeof birthday === 'string') updates.birthday = new Date(birthday);
    if (gender) updates.gender = gender;

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        profilePicture: updated.profilePicture,
      contactNumber: (updated as any).contactNumber,
      address: (updated as any).address,
      birthday: (updated as any).birthday,
      gender: (updated as any).gender,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'refurnish-profile',
      public_id: `user_${(req as any).user._id}_${Date.now()}`,
      overwrite: true,
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

// Admin: List users with pagination and optional search
export const listUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || "10", 10), 1),
      100
    );
    const search = ((req.query.search as string) || "").trim();

    const filter: any = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("firstName lastName email role createdAt profilePicture")
        .lean(),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const data = users.map((u: any) => ({
      _id: u._id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim(),
      email: u.email,
      role: u.role,
      profilePicture: u.profilePicture,
      createdDate: u.createdAt,
    }));

    return res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Admin: Update a user's basic fields
export const adminUpdateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { firstName, lastName, email, role } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: 'buyer' | 'seller' | 'admin';
    };

    const updates: any = {};
    if (typeof firstName === 'string') updates.firstName = firstName;
    if (typeof lastName === 'string') updates.lastName = lastName;
    if (typeof email === 'string') {
      if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
      updates.email = email;
    }
    if (role) updates.role = role;

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    // Notify listeners
    io.emit('user_updated', { id: updated._id });

    return res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update user' });
  }
};

// Admin: Delete a user after confirming admin password
export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { adminPassword } = req.body as { adminPassword: string };

    // Verify the requester is an admin and password matches
    const adminUser = await User.findById((req as any).user._id);
    if (!adminUser || adminUser.role !== 'admin' || !adminUser.password) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const ok = await bcrypt.compare(adminPassword, adminUser.password);
    if (!ok) return res.status(401).json({ message: 'Invalid admin password' });

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    // Notify listeners
    io.emit('user_deleted', { id });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Authenticated lookup by email (non-admin) - smart search with multiple results
export const lookupUserByEmail = async (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email is required' });

    // First try exact match
    const exactUser = await User.findOne({ email }).select('_id firstName lastName email role profilePicture');
    if (exactUser) {
      return res.status(200).json([{
        id: exactUser._id,
        firstName: exactUser.firstName,
        lastName: exactUser.lastName,
        email: exactUser.email,
        role: exactUser.role,
        profilePicture: exactUser.profilePicture,
      }]);
    }

    // If no exact match, do smart search with partial matches
    const searchTerm = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
    const users = await User.find({
      $or: [
        { email: { $regex: searchTerm, $options: 'i' } },
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: searchTerm, options: 'i' } } }
      ]
    })
    .select('_id firstName lastName email role profilePicture')
    .limit(5)
    .sort({ email: 1 });

    const results = users.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    }));

    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ error: 'Lookup failed' });
  }
};

export const updateUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    await User.findByIdAndUpdate(userId, { 
      lastActive: new Date(),
      isOnline: true 
    });
    return res.status(200).json({ message: 'Activity updated' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update activity' });
  }
};

export const getActiveUsers = async (req: Request, res: Response) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await User.find({
      lastActive: { $gte: fiveMinutesAgo },
      isOnline: true
    }).select('_id firstName lastName email role profilePicture lastActive isOnline');
    
    return res.status(200).json(activeUsers);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch active users' });
  }
};

export const getActiveUsersForMessaging = async (req: Request, res: Response) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await User.find({
      lastActive: { $gte: fiveMinutesAgo },
      isOnline: true
    }).select('_id firstName lastName email role profilePicture lastActive isOnline');
    
    return res.status(200).json(activeUsers);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch active users' });
  }
};

// Follow a user
export const followUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user._id;
    const { userId } = req.params;

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    if (currentUser.following?.includes(userId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId },
      $inc: { followingCount: 1 }
    });

    // Add to target user's followers list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId },
      $inc: { followerCount: 1 }
    });

    res.status(200).json({ message: 'User followed successfully' });
  } catch (e) {
    console.error('Error following user:', e);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

// Unfollow a user
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user._id;
    const { userId } = req.params;

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if currently following
    if (!currentUser.following?.includes(userId)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove from following list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
      $inc: { followingCount: -1 }
    });

    // Remove from target user's followers list
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
      $inc: { followerCount: -1 }
    });

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (e) {
    console.error('Error unfollowing user:', e);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

// Check if user is following another user
export const checkFollowStatus = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user._id;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = currentUser.following?.includes(userId) || false;
    res.status(200).json({ isFollowing });
  } catch (e) {
    console.error('Error checking follow status:', e);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user?._id;

    console.log(`Getting followers for user: ${userId}, current user: ${currentUserId}`);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', {
      id: user._id,
      followers: user.followers,
      followersPublic: user.followersPublic
    });

    // Check if the current user is viewing their own profile or if followers is public
    const isOwnProfile = currentUserId && currentUserId.toString() === userId.toString();
    const isFollowersPublic = user.followersPublic !== false; // Default to true
    
    // Check if current user is following the target user (for private lists)
    let isFollowingUser = false;
    if (!isOwnProfile && !isFollowersPublic && currentUserId) {
      const currentUser = await User.findById(currentUserId);
      isFollowingUser = currentUser && currentUser.following && currentUser.following.includes(userId);
    }

    if (!isOwnProfile && !isFollowersPublic && !isFollowingUser) {
      return res.status(403).json({ error: 'Followers list is private' });
    }

    // Get follower details
    const followerIds = user.followers || [];
    const followers = followerIds.length > 0 ? await User.find(
      { _id: { $in: followerIds } },
      { _id: 1, firstName: 1, lastName: 1, email: 1, profilePicture: 1, role: 1 }
    ) : [];

    res.status(200).json({ followers });
  } catch (e) {
    console.error('Error getting followers:', e);
    res.status(500).json({ error: 'Failed to get followers' });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user?._id;

    console.log(`Getting following for user: ${userId}, current user: ${currentUserId}`);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', {
      id: user._id,
      following: user.following,
      followingPublic: user.followingPublic
    });

    // Check if the current user is viewing their own profile or if following is public
    const isOwnProfile = currentUserId && currentUserId.toString() === userId.toString();
    const isFollowingPublic = user.followingPublic !== false; // Default to true
    
    // Check if current user is following the target user (for private lists)
    let isFollowingUser = false;
    if (!isOwnProfile && !isFollowingPublic && currentUserId) {
      const currentUser = await User.findById(currentUserId);
      isFollowingUser = currentUser && currentUser.following && currentUser.following.includes(userId);
    }

    if (!isOwnProfile && !isFollowingPublic && !isFollowingUser) {
      return res.status(403).json({ error: 'Following list is private' });
    }

    // Get following details
    const followingIds = user.following || [];
    const following = followingIds.length > 0 ? await User.find(
      { _id: { $in: followingIds } },
      { _id: 1, firstName: 1, lastName: 1, email: 1, profilePicture: 1, role: 1 }
    ) : [];

    res.status(200).json({ following });
  } catch (e) {
    console.error('Error getting following:', e);
    res.status(500).json({ error: 'Failed to get following' });
  }
};

export const updatePrivacySettings = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user._id;
    const { followersPublic, followingPublic } = req.body;

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update privacy settings
    if (followersPublic !== undefined) {
      user.followersPublic = followersPublic;
    }
    if (followingPublic !== undefined) {
      user.followingPublic = followingPublic;
    }

    await user.save();

    res.status(200).json({ 
      message: 'Privacy settings updated successfully',
      followersPublic: user.followersPublic,
      followingPublic: user.followingPublic
    });
  } catch (e) {
    console.error('Error updating privacy settings:', e);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
};

// OTP Controllers
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email, type = 'login' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email exists for login/admin OTP
    if (type === 'login' || type === 'admin') {
      // For admin, check if it's the admin email
      if (type === 'admin' && email === 'admin@refurnish.dev') {
        // Admin login is valid, proceed to send OTP
      } else {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
      }
    }

    // Check OTP attempts
    const canSendOTP = await checkOTPAttempts(email, type);
    if (!canSendOTP) {
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }

    await createOTP(email, type);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp, type = 'login' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const isValid = await verifyOTPService(email, otp, type);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

export const checkLastLogin = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lastLogin = user.lastActive || user.createdAt;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const needsOTP = lastLogin < oneMonthAgo;

    res.status(200).json({ 
      needsOTP,
      lastLogin: lastLogin.toISOString()
    });
  } catch (error) {
    console.error('Error checking last login:', error);
    res.status(500).json({ error: 'Failed to check last login' });
  }
};

export const getCurrentOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { type = 'login' } = req.query;

    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }

    const OTP = require('../models/otp.model').default;
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(404).json({ error: 'No active OTP found' });
    }

    res.status(200).json({ 
      otp: otpRecord.otp,
      expiresAt: otpRecord.expiresAt
    });
  } catch (error) {
    console.error('Error getting current OTP:', error);
    res.status(500).json({ error: 'Failed to get current OTP' });
  }
};