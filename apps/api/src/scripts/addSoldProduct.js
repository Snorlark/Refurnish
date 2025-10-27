const mongoose = require('mongoose');
require('dotenv').config();

// Minimal Product schema matching the TS model (including "sold")
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: false },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  images: { type: [String], required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true, enum: ['for_sale', 'for_swap', 'both', 'sold'] },
}, { timestamps: true });

const userSchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set in environment');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Prefer the admin user if present, otherwise just take any user
    let owner = await User.findOne({ email: 'admin@refurnish.dev' });
    if (!owner) {
      owner = await User.findOne();
    }
    if (!owner) {
      throw new Error('No users found to set as product owner. Create a user first.');
    }

    const product = new Product({
      title: 'Vintage Desk',
      description: 'A beautiful vintage desk made of mahogany wood.',
      price: 250,
      condition: 'Used',
      category: 'Furniture',
      images: ['https://res.cloudinary.com/dbsf9vgkc/image/upload/v157533806/ecommerce/vintage_desk.jpg'],
      location: 'Manila',
      owner: owner._id,
      status: 'sold',
    });

    await product.save();
    console.log('Sold product inserted successfully:');
    console.log({
      _id: product._id.toString(),
      title: product.title,
      price: product.price,
      status: product.status,
      owner: product.owner.toString(),
    });
  } catch (err) {
    console.error('Error inserting sold product:', err.message || err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();


