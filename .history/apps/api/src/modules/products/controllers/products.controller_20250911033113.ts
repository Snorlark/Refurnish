
mport mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price?: number; // Optional if the product is for swap
  condition: string;
  category: string;
  images: string[];
  location: string;
  owner: mongoose.Schema.Types.ObjectId;
  status: "for_sale" | "for_swap" | "both"; // New field for sale or swap logic
}

const ProductSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: false }, // Made optional
  condition: { type: String, required: true },
  category: { type: String, required: true },
  images: { type: [String], required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    required: true,
    enum: ["for_sale", "for_swap", "both"],
  },
});

export default mongoose.model<IProduct>("Product", ProductSchema);
