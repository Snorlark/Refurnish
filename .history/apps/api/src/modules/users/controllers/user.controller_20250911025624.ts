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
