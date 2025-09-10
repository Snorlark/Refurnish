// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modules/users/models/user.model";
import config from "../config/config";

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can use a more specific type here
    }
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded: any = jwt.verify(token, config.jwtSecret);

    // Attach user to the request object
    req.user = { _id: decoded._id };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
