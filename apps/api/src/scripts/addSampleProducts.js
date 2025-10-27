const mongoose = require('mongoose');
require('dotenv').config();

// Define the User schema (simplified version for this script)
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  isEmailVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Define the Product schema with new attributes
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  swapWantedDescription: { type: String, required: false }, // What the seller wants in exchange
  price: { type: Number, required: false },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  images: { type: [String], required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    required: true,
    enum: ["listed", "sold", "for_approval"],
  },
  material: {
    type: String,
    required: true,
    enum: ["wood", "plastic", "steel"],
  },
  age: {
    value: { type: Number, required: true },
    unit: { type: String, required: true, enum: ["years", "months", "days"] },
  },
  listedAs: {
    type: String,
    required: true,
    enum: ["sale", "swap", "both"],
  },
  mode_of_payment: {
    type: String,
    required: true,
    enum: ["cash", "bank", "gcash/maya"],
  },
  courier: {
    type: String,
    required: true,
    enum: ["J&T Express", "Lalamove", "LBC Express"],
  },
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);

// Sample products data
const sampleProducts = [
  {
    title: "Vintage Oak Dining Table",
    description: "Beautiful vintage oak dining table with intricate woodwork details. Perfect for family gatherings and dinner parties. Shows some signs of age but adds character to any home.",
    swapWantedDescription: "Looking for a modern coffee table or bookshelf",
    price: 15000,
    condition: "Good",
    category: "Furniture",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"],
    location: "Quezon City, Metro Manila",
    status: "for_approval",
    material: "wood",
    age: { value: 3, unit: "years" },
    listedAs: "both",
    mode_of_payment: "bank",
    courier: "Lalamove"
  },
  {
    title: "Modern Steel Office Chair",
    description: "Ergonomic steel-framed office chair with adjustable height and lumbar support. Great for home office or workspace. Minimal wear, excellent condition.",
    // No swapWantedDescription for sale-only products
    price: 8500,
    condition: "Excellent",
    category: "Office Furniture",
    images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500"],
    location: "Makati City, Metro Manila",
    status: "for_approval",
    material: "steel",
    age: { value: 8, unit: "months" },
    listedAs: "sale",
    mode_of_payment: "gcash/maya",
    courier: "J&T Express"
  },
  {
    title: "Plastic Storage Cabinet",
    description: "Multi-purpose plastic storage cabinet with multiple compartments. Ideal for organizing clothes, books, or household items. Lightweight and easy to assemble.",
    swapWantedDescription: "Would love to trade for a wooden dresser or nightstand",
    // No price for swap-only products
    condition: "Fair",
    category: "Storage",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"],
    location: "Taguig City, Metro Manila",
    status: "for_approval",
    material: "plastic",
    age: { value: 6, unit: "months" },
    listedAs: "swap",
    mode_of_payment: "cash",
    courier: "LBC Express"
  }
];

async function addSampleProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to use as owner
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Please run initAdmin.js first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Using admin user: ${adminUser.email} as product owner`);

    // Add each sample product
    for (const productData of sampleProducts) {
      const product = new Product({
        ...productData,
        owner: adminUser._id
      });

      await product.save();
      console.log(`Added product: ${product.title}`);
    }

    console.log('Successfully added 3 sample products with for_approval status!');

  } catch (error) {
    console.error('Error adding sample products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSampleProducts();
