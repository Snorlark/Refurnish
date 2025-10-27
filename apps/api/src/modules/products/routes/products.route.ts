// src/modules/products/routes/product.routes.ts
import { Router } from "express";
import {
  uploadProduct,
  getProducts,
  getProductsByUser,
  getProductById,
  updateProduct,
  deleteProduct,
  getTotalSales,
  getWeeklyAnalytics,
  getProductsForApproval,
  moderateProduct,
  getMonthlyEarnings,
  uploadImage,
  createProduct,
  markProductAsSold,
} from "../controllers/products.controller";
import authMiddleware from "../../../middleware/auth";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const productRoutes = Router();

productRoutes.get("/", getProducts);

productRoutes.get("/user/:userId", getProductsByUser);

productRoutes.get("/total-sales", getTotalSales);
productRoutes.get("/earnings/monthly", getMonthlyEarnings);

productRoutes.get("/analytics/weekly", getWeeklyAnalytics);

productRoutes.get("/for-approval", getProductsForApproval);

productRoutes.get("/:id", getProductById);

productRoutes.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  uploadProduct
);

productRoutes.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadImage
);

productRoutes.post(
  "/create",
  authMiddleware,
  createProduct
);

productRoutes.put(
  "/:id/sold",
  authMiddleware,
  markProductAsSold
);

productRoutes.put("/:id", authMiddleware, updateProduct);

productRoutes.delete("/:id", authMiddleware, deleteProduct);

productRoutes.post("/:id/moderate", authMiddleware, moderateProduct);

export default productRoutes;
