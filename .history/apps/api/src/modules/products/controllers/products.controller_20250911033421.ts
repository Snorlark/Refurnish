// src/modules/products/controllers/product.controller.ts
import { Request, Response } from "express";
import cloudinary from "cloudinary";
import Product from "../models/products.model";
import { IProduct } from "../models/products.model";

export const uploadProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, condition, category, location, status } =
      req.body;
    const image = req.file;

    // Logic for required fields based on status
    if (status === "for_sale" && !price) {
      return res
        .status(400)
        .json({ error: "Price is required for a product for sale." });
    }
    if (status !== "for_sale" && price) {
      // Optional: you can choose to ignore a price if the status is not for sale
      // For now, we'll allow it if status is 'both'
      if (status === "for_swap" && price) {
        console.log("Price will be ignored for a swap-only product.");
      }
    }

    // Upload image to Cloudinary (assuming it's a single image for this snippet)
    const result = await cloudinary.v2.uploader.upload(image.path, {
      folder: "ecommerce-products",
    });

    const newProduct: IProduct = new Product({
      title,
      description,
      price: status === "for_sale" || status === "both" ? price : undefined,
      condition,
      category,
      location,
      images: [result.secure_url],
      owner: req.user._id, // Assumes user is authenticated via JWT
      status,
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
  try {
    const { status, search, category, location } = req.query;
    const query: any = {};

    // Filter by status if provided in the query
    if (status && ["for_sale", "for_swap", "both"].includes(status as string)) {
      query.status = status;
    }

    // Additional filtering logic
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = location;
    }

    const products = await Product.find(query).populate("owner", "email");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
