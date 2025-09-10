// src/modules/products/routes/product.routes.ts
import { Router } from "express";
import {
  uploadProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller";
import authMiddleware from "../../middleware/auth";
import multer from "multer";

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

const router = Router();

// Public routes for the product catalog
// Get all products with search and filter
router.get("/", getProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Protected routes for sellers
// Upload a new product listing (requires authentication)
router.post("/upload", authMiddleware, upload.single("image"), uploadProduct);

// Update a product listing by ID (requires authentication)
router.put("/:id", authMiddleware, updateProduct);

// Delete a product listing by ID (requires authentication)
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
