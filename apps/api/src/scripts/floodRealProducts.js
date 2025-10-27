const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  isEmailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const SellerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, required: true, trim: true },
  address: { type: String },
  contactNumber: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  swapWantedDescription: { type: String, required: false },
  price: { type: Number, required: false },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  images: { type: [String], required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, required: true, enum: ["sold", "for_approval", "listed"] },
  material: { type: String, required: true, enum: ["wood", "plastic", "steel"] },
  age: {
    value: { type: Number, required: true },
    unit: { type: String, required: true, enum: ["years", "months", "days"] },
  },
  listedAs: { type: String, required: true, enum: ["sale", "swap", "both"] },
  mode_of_payment: { type: String, required: true, enum: ["cash", "bank", "gcash/maya"] },
  courier: { type: String, required: true, enum: ["J&T Express", "Lalamove", "LBC Express"] },
  swapWantedCategory: { type: String, required: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const SellerProfile = mongoose.model('SellerProfile', SellerProfileSchema);
const Product = mongoose.model('Product', ProductSchema);

// Realistic furniture products
const realProducts = [
  {
    title: "Vintage Oak Dining Table",
    description: "Beautiful vintage oak dining table with intricate woodwork details. Perfect for family gatherings and dinner parties. Shows some signs of age but adds character to any home. Seats 6 people comfortably.",
    price: 25000,
    condition: "Good",
    category: "DINING FURNITURE",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"],
    location: "Quezon City, Metro Manila",
    status: "listed",
    material: "wood",
    age: { value: 5, unit: "years" },
    listedAs: "sale",
    mode_of_payment: "bank",
    courier: "Lalamove"
  },
  {
    title: "Modern Steel Office Chair",
    description: "Ergonomic steel-framed office chair with adjustable height and lumbar support. Great for home office or workspace. Minimal wear, excellent condition. Black leather upholstery.",
    price: 12000,
    condition: "Excellent",
    category: "OFFICE FURNITURE",
    images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=600&fit=crop"],
    location: "Makati City, Metro Manila",
    status: "listed",
    material: "steel",
    age: { value: 1, unit: "years" },
    listedAs: "sale",
    mode_of_payment: "gcash/maya",
    courier: "J&T Express"
  },
  {
    title: "Plastic Storage Cabinet",
    description: "Multi-purpose plastic storage cabinet with multiple compartments. Ideal for organizing clothes, books, or household items. Lightweight and easy to assemble. White color.",
    swapWantedDescription: "Would love to trade for a wooden dresser or nightstand",
    condition: "Fair",
    category: "STORAGE FURNITURE",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"],
    location: "Taguig City, Metro Manila",
    status: "listed",
    material: "plastic",
    age: { value: 2, unit: "years" },
    listedAs: "swap",
    mode_of_payment: "cash",
    courier: "LBC Express",
    swapWantedCategory: "BEDROOM FURNITURE"
  },
  {
    title: "Leather Sofa Set",
    description: "Comfortable 3-seater leather sofa in excellent condition. Perfect for living room. Brown leather with wooden legs. Very comfortable and stylish.",
    price: 35000,
    condition: "Excellent",
    category: "LIVING ROOM FURNITURE",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"],
    location: "Pasig City, Metro Manila",
    status: "listed",
    material: "wood",
    age: { value: 3, unit: "years" },
    listedAs: "both",
    mode_of_payment: "bank",
    courier: "Lalamove",
    swapWantedDescription: "Looking for a modern coffee table or bookshelf",
    swapWantedCategory: "LIVING ROOM FURNITURE"
  },
  {
    title: "Wooden Bookshelf",
    description: "Tall wooden bookshelf with 5 shelves. Perfect for storing books, decorations, or office supplies. Natural wood finish. Some minor scratches but structurally sound.",
    price: 8000,
    condition: "Good",
    category: "STORAGE FURNITURE",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"],
    location: "Mandaluyong City, Metro Manila",
    status: "listed",
    material: "wood",
    age: { value: 4, unit: "years" },
    listedAs: "sale",
    mode_of_payment: "gcash/maya",
    courier: "J&T Express"
  },
  {
    title: "Metal Bed Frame",
    description: "Sturdy metal bed frame for queen size mattress. Black powder-coated finish. Easy to assemble and disassemble. No mattress included.",
    swapWantedDescription: "Interested in trading for a wooden dresser or nightstand",
    condition: "Good",
    category: "BEDROOM FURNITURE",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"],
    location: "Marikina City, Metro Manila",
    status: "listed",
    material: "steel",
    age: { value: 2, unit: "years" },
    listedAs: "swap",
    mode_of_payment: "cash",
    courier: "LBC Express",
    swapWantedCategory: "BEDROOM FURNITURE"
  },
  {
    title: "Glass Coffee Table",
    description: "Modern glass coffee table with chrome legs. Perfect for living room centerpiece. Tempered glass top, very sturdy. Some minor scratches on legs.",
    price: 15000,
    condition: "Good",
    category: "LIVING ROOM FURNITURE",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"],
    location: "San Juan City, Metro Manila",
    status: "listed",
    material: "steel",
    age: { value: 1, unit: "years" },
    listedAs: "sale",
    mode_of_payment: "bank",
    courier: "Lalamove"
  },
  {
    title: "Plastic Dining Chairs Set",
    description: "Set of 4 plastic dining chairs in white. Lightweight and easy to clean. Perfect for outdoor dining or casual indoor use. All chairs in good condition.",
    price: 5000,
    condition: "Good",
    category: "DINING FURNITURE",
    images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=600&fit=crop"],
    location: "Parañaque City, Metro Manila",
    status: "listed",
    material: "plastic",
    age: { value: 1, unit: "years" },
    listedAs: "sale",
    mode_of_payment: "gcash/maya",
    courier: "J&T Express"
  }
];

async function floodRealProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find verified sellers (users with approved seller profiles)
    const verifiedSellers = await User.aggregate([
      {
        $lookup: {
          from: 'sellerprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'sellerProfile'
        }
      },
      {
        $match: {
          role: 'seller',
          'sellerProfile.status': 'approved'
        }
      }
    ]);

    if (verifiedSellers.length === 0) {
      console.log('No verified sellers found. Creating a test seller...');
      
      // Create a test seller
      const testSeller = new User({
        firstName: 'Test',
        lastName: 'Seller',
        email: 'testseller@refurnish.com',
        password: 'password123',
        role: 'seller',
        isEmailVerified: true
      });
      
      await testSeller.save();
      
      // Create approved seller profile
      const sellerProfile = new SellerProfile({
        userId: testSeller._id,
        shopName: 'Test Furniture Shop',
        address: 'Metro Manila',
        contactNumber: '+639123456789',
        status: 'approved'
      });
      
      await sellerProfile.save();
      verifiedSellers.push(testSeller);
    }

    console.log(`Found ${verifiedSellers.length} verified sellers`);

    // Add each product
    for (let i = 0; i < realProducts.length; i++) {
      const productData = realProducts[i];
      const randomSeller = verifiedSellers[Math.floor(Math.random() * verifiedSellers.length)];
      
      const product = new Product({
        ...productData,
        owner: randomSeller._id
      });

      await product.save();
      console.log(`Added product ${i + 1}: ${product.title} (Owner: ${randomSeller.firstName} ${randomSeller.lastName})`);
    }

    console.log(`Successfully added ${realProducts.length} real products!`);

  } catch (error) {
    console.error('Error adding real products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

floodRealProducts();
