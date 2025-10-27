/*
  Seed script to bulk-insert listed products by category.
  Usage (from apps/api):
    node ./src/scripts/addListedProducts.js
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Schema } = mongoose;

// Minimal Product model (CommonJS require to avoid TS transpilation for script)
const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: false },
    condition: { type: String, required: true },
    category: { type: String, required: true },
    images: { type: [String], required: true },
    location: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true, enum: ['sold', 'for_approval', 'listed'] },
    material: { type: String, required: true, enum: ['wood', 'plastic', 'steel'] },
    age: {
      value: { type: Number, required: true },
      unit: { type: String, required: true, enum: ['years', 'months', 'days'] },
    },
    listedAs: { type: String, required: true, enum: ['sale', 'swap'] },
    mode_of_payment: { type: String, required: true, enum: ['cash', 'bank', 'gcash/maya'] },
    courier: { type: String, required: true, enum: ['J&T Express', 'Lalamove', 'LBC Express'] },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}

const IMAGE_URL = 'https://res.cloudinary.com/dbsf9vgkc/image/upload/v1757534682/ecommerce-products/sgzgzneaujyhfb7amji1.jpg';
const OWNER_ID = '68d53b819999c79ee1c326a1';

// Requested quantities per category
const categoryToCount = [
  ['CHAIRS', 5],
  ['TABLES', 3],
  ['SOFA', 4],
  ['CABINET', 2],
  ['DECOR', 7],
  ['MIRROR', 6],
  ['LAMP', 6],
  ['VANITY', 1],
  ['SHELVES', 4],
];

// Simple helpers to generate consistent but varied values
const materials = ['wood', 'plastic', 'steel'];
const couriers = ['Lalamove', 'J&T Express', 'LBC Express'];

function generateProducts() {
  const docs = [];
  let seedIndex = 1;
  for (const [category, count] of categoryToCount) {
    for (let i = 1; i <= count; i += 1) {
      const material = materials[seedIndex % materials.length];
      const courier = couriers[seedIndex % couriers.length];
      const price = 1000 + (seedIndex % 20) * 250; // some variety

      docs.push({
        title: `${category} Item ${i}`,
        description: `High-quality ${category.toLowerCase()} item number ${i}.`,
        price,
        condition: 'Good',
        category,
        images: [IMAGE_URL],
        location: 'Metro Manila',
        owner: new mongoose.Types.ObjectId(OWNER_ID),
        status: 'listed',
        material,
        age: { value: 1 + (seedIndex % 3), unit: 'years' },
        listedAs: 'sale',
        mode_of_payment: 'cash',
        courier,
      });

      seedIndex += 1;
    }
  }
  return docs;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const products = generateProducts();
  const result = await Product.insertMany(products);
  console.log(`Inserted ${result.length} products.`);

  await mongoose.disconnect();
  console.log('Disconnected');
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});


