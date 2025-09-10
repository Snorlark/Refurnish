import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    const token = user.generateAuthToken();
    res.status(201).json({ token, message: "User registered successfully!" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = user.generateAuthToken();
    res.json({ token, message: "Logged in successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
