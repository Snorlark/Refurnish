// src/modules/products/models/product.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  condition: string; // "New," "Used," "Fair," etc.
  category: string;
  images: string[];
  location: string;
  owner: mongoose.Schema.Types.ObjectId; // Reference to the User model
}

const ProductSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  images: { type: [String], required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model<IProduct>("Product", ProductSchema);
