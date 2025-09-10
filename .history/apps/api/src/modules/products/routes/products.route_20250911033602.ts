// src/modules/products/routes/product.routes.ts
import { Router } from "express";
import {
  uploadProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import authMiddleware from "../../../middleware/auth";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/upload", authMiddleware, upload.single("image"), uploadProduct);

router.put("/:id", authMiddleware, updateProduct);

router.delete("/:id", authMiddleware, deleteProduct);

export default router;
