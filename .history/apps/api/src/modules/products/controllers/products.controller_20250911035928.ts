import { Request, Response } from "express";
import cloudinary from "cloudinary";
import Product, { IProduct } from "../models/products.model";

declare global {
  namespace Express {
    interface Request {
      file?: any;
    }
  }
}

export const uploadProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, condition, category, location, status } =
      req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: "Image file is required." });
    }

    if (status === "for_sale" && !price) {
      return res
        .status(400)
        .json({ error: "Price is required for a product for sale." });
    }

    const result = await cloudinary.v2.uploader.upload(image.path, {
      folder: "ecommerce-products",
      public_id: `${product.title.replace(/\s/g, "_")}-${new Date().getTime()}`,
    });

    const newProduct: IProduct = new Product({
      title,
      description,
      price: status === "for_sale" || status === "both" ? price : undefined,
      condition,
      category,
      location,
      images: [result.secure_url],
      owner: req.user._id,
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

    if (status && ["for_sale", "for_swap", "both"].includes(status as string)) {
      query.status = status;
    }
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

// --- Missing Controller Functions ---

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "email"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
