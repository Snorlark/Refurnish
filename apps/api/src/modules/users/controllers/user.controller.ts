import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import config from "../../../config/config";

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
    const { googleId, email, firstName, lastName, profilePicture } = req.body;

    if (!googleId || !email || !firstName || !lastName) {
      return res.status(400).json({ error: "Google authentication data incomplete" });
    }

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with email but no Google ID
      user = await User.findOne({ email });
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.profilePicture = profilePicture;
        await user.save();
      } else {
        // Create new user
        user = new User({
          googleId,
          email,
          firstName,
          lastName,
          profilePicture,
          isEmailVerified: true,
          role: 'buyer'
        });
        await user.save();
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
        role: user.role,
        profilePicture: user.profilePicture
      },
      message: "Google authentication successful!" 
    });
  } catch (err: any) {
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
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
