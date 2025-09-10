// src/modules/products/controllers/product.controller.ts
import { Request, Response } from "express";
import Product from "../models/product.model";
import cloudinary from "cloudinary";

export const uploadProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;
    // Assuming Multer has processed the image upload and it's available at req.file
    const image = req.file;

    // Upload image to Cloudinary
    const result = await cloudinary.v2.uploader.upload(image.path, {
      folder: "ecommerce-products",
    });

    const newProduct = new Product({
      title,
      description,
      price,
      images: [result.secure_url], // Store the Cloudinary URL
      owner: req.user._id, // Assumes user is authenticated via JWT
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product uploaded successfully!", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload product" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  // Logic to fetch products with filtering, search, and pagination
  try {
    const products = await Product.find({}).populate("owner", "email");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
