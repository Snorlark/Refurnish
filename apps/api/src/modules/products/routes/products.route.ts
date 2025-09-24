// src/modules/products/routes/product.routes.ts
import { Router } from "express";
import {
  uploadProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller";
import authMiddleware from "../../../middleware/auth";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const productRoutes = Router();

productRoutes.get("/", getProducts);

productRoutes.get("/:id", getProductById);

productRoutes.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  uploadProduct
);

productRoutes.put("/:id", authMiddleware, updateProduct);

productRoutes.delete("/:id", authMiddleware, deleteProduct);

export default productRoutes;
