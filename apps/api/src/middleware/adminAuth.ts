// src/middleware/adminAuth.ts
import { Request, Response, NextFunction } from "express";

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and has admin role
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export default adminAuth;
