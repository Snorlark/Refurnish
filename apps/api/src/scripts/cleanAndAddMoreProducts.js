const mongoose = require('mongoose');
require('dotenv').config();

// Models (inline for script use only)
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isEmailVerified: Boolean,
}, { timestamps: true });

const SellerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopName: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'] },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  swapWantedDescription: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  condition: String,
  category: String,
  images: [String],
  location: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['sold', 'for_approval', 'listed'] },
  material: { type: String, enum: ['wood', 'plastic', 'steel'] },
  age: {
    value: Number,
    unit: { type: String, enum: ['years', 'months', 'days'] }
  },
  listedAs: { type: String, enum: ['sale', 'swap', 'both'] },
  mode_of_payment: { type: String, enum: ['cash', 'bank', 'gcash/maya'] },
  courier: { type: String, enum: ['J&T Express', 'Lalamove', 'LBC Express'] },
  swapWantedCategory: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const SellerProfile = mongoose.model('SellerProfile', SellerProfileSchema);
const Product = mongoose.model('Product', ProductSchema);

// Allowed/original categories only
const ORIGINAL_CATEGORIES = [
  'CHAIRS', 'TABLES', 'SOFA', 'CABINET', 'DECOR', 'MIRROR', 'LAMP', 'VANITY', 'SHELVES'
];

// Use ONLY local images from public to avoid broken links or human photos
const localImages = [
  '/products/chair/view1.jpg',
  '/products/chair/view2.jpg',
  '/products/chair/view3.jpg',
  '/products/chair/view4.jpg',
  '/products/chair/view5.jpg',
];

// Helper to pick 1-2 images
function getImages(count = 1) {
  const imgs = [];
  for (let i = 0; i < count; i++) {
    imgs.push(localImages[(Math.floor(Math.random() * localImages.length))]);
  }
  return imgs;
}

// Products to add (use only ORIGINAL_CATEGORIES and local images)
const newProducts = [
  {
    title: 'Modern Lounge Chair',
    description: 'Comfortable lounge chair with fabric upholstery and wooden legs. Minimal wear.',
    price: 7500,
    condition: 'Good',
    category: 'CHAIRS',
    images: getImages(2),
    location: 'Makati City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'gcash/maya',
    courier: 'J&T Express'
  },
  {
    title: 'Solid Wood Table',
    description: 'Sturdy rectangular dining table, natural finish, seats 6.',
    price: 14000,
    condition: 'Good',
    category: 'TABLES',
    images: getImages(2),
    location: 'Quezon City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 3, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'bank',
    courier: 'Lalamove'
  },
  {
    title: 'Compact Sofa Loveseat',
    description: 'Two-seater fabric sofa, neutral color, great for small spaces.',
    price: 11000,
    condition: 'Good',
    category: 'SOFA',
    images: getImages(2),
    location: 'Pasig City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 1, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'cash',
    courier: 'LBC Express'
  },
  {
    title: 'Vertical Storage Cabinet',
    description: 'Tall cabinet with multiple shelves and doors, perfect for storage.',
    price: 6200,
    condition: 'Good',
    category: 'CABINET',
    images: getImages(2),
    location: 'Taguig City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 2, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'gcash/maya',
    courier: 'J&T Express'
  },
  {
    title: 'Decorative Wall Mirror',
    description: 'Large round wall mirror with metal frame.',
    price: 3500,
    condition: 'Good',
    category: 'MIRROR',
    images: getImages(1),
    location: 'Mandaluyong City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 2, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'cash',
    courier: 'Lalamove'
  },
  {
    title: 'Industrial Floor Lamp',
    description: 'Adjustable floor lamp, matte black finish, E27 socket.',
    price: 2800,
    condition: 'Good',
    category: 'LAMP',
    images: getImages(1),
    location: 'San Juan City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 1, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'bank',
    courier: 'Lalamove'
  },
  {
    title: 'Vanity Table with Mirror',
    description: 'White vanity table with storage drawers and matching mirror.',
    price: 9000,
    condition: 'Good',
    category: 'VANITY',
    images: getImages(2),
    location: 'Parañaque City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'gcash/maya',
    courier: 'J&T Express'
  },
  {
    title: 'Open Bookshelf',
    description: '5-tier open bookshelf in natural wood finish.',
    price: 5200,
    condition: 'Good',
    category: 'SHELVES',
    images: getImages(2),
    location: 'Quezon City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 3, unit: 'years' },
    listedAs: 'sale',
    mode_of_payment: 'cash',
    courier: 'LBC Express'
  },
  {
    title: 'Decor Set Bundle',
    description: 'Assorted home decor bundle including vases and frames.',
    price: 1800,
    condition: 'Good',
    category: 'DECOR',
    images: getImages(1),
    location: 'Pasig City, Metro Manila',
    status: 'listed',
    material: 'plastic',
    age: { value: 8, unit: 'months' },
    listedAs: 'sale',
    mode_of_payment: 'gcash/maya',
    courier: 'J&T Express'
  },
  // Swap-only products
  {
    title: 'Swap: Wooden Accent Chair',
    description: 'Sturdy accent chair, great condition, wooden frame and fabric seat.',
    condition: 'Good',
    category: 'CHAIRS',
    images: getImages(2),
    location: 'Makati City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'J&T Express',
    swapWantedCategory: 'TABLES',
    swapWantedDescription: 'Looking to trade for a compact side table.'
  },
  {
    title: 'Swap: Metal Bedside Cabinet',
    description: 'Compact cabinet with drawer and door, perfect as bedside storage.',
    condition: 'Good',
    category: 'CABINET',
    images: getImages(2),
    location: 'Taguig City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 1, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'LBC Express',
    swapWantedCategory: 'LAMP',
    swapWantedDescription: 'Prefer a minimalist floor lamp.'
  },
  {
    title: 'Swap: Minimalist Wall Mirror',
    description: 'Medium-sized wall mirror with thin frame, like new.',
    condition: 'Excellent',
    category: 'MIRROR',
    images: getImages(1),
    location: 'San Juan City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 6, unit: 'months' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'Lalamove',
    swapWantedCategory: 'DECOR',
    swapWantedDescription: 'Open to framed artwork or decor bundle.'
  },
  // Both (sale + swap)
  {
    title: 'Convertible Coffee Table',
    description: 'Coffee table with storage; willing to swap for shelves.',
    price: 7000,
    condition: 'Good',
    category: 'TABLES',
    images: getImages(2),
    location: 'Quezon City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'both',
    mode_of_payment: 'bank',
    courier: 'Lalamove',
    swapWantedCategory: 'SHELVES',
    swapWantedDescription: 'Prefer a 4-5 tier open shelf.'
  },
  {
    title: 'Sofa with Ottoman Set',
    description: 'Comfy sofa with matching ottoman; open to swap for cabinets.',
    price: 15000,
    condition: 'Good',
    category: 'SOFA',
    images: getImages(2),
    location: 'Pasig City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 3, unit: 'years' },
    listedAs: 'both',
    mode_of_payment: 'gcash/maya',
    courier: 'J&T Express',
    swapWantedCategory: 'CABINET',
    swapWantedDescription: 'Tall storage cabinet preferred.'
  },
  // More swap-only products to balance the catalog
  {
    title: 'Swap: Vintage Wooden Chair',
    description: 'Classic wooden chair with character, perfect for dining or office.',
    condition: 'Good',
    category: 'CHAIRS',
    images: getImages(2),
    location: 'Makati City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 4, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'J&T Express',
    swapWantedCategory: 'TABLES',
    swapWantedDescription: 'Looking for a small side table or coffee table.'
  },
  {
    title: 'Swap: Modern Side Table',
    description: 'Clean side table with drawer, minimal design.',
    condition: 'Excellent',
    category: 'TABLES',
    images: getImages(2),
    location: 'Taguig City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 1, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'LBC Express',
    swapWantedCategory: 'CHAIRS',
    swapWantedDescription: 'Prefer an accent chair or stool.'
  },
  {
    title: 'Swap: Sectional Sofa Piece',
    description: 'Single piece from sectional sofa, comfortable and clean.',
    condition: 'Good',
    category: 'SOFA',
    images: getImages(2),
    location: 'Pasig City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'Lalamove',
    swapWantedCategory: 'CABINET',
    swapWantedDescription: 'Looking for a storage cabinet or dresser.'
  },
  {
    title: 'Swap: Storage Cabinet Unit',
    description: 'Multi-drawer storage unit, great for organizing.',
    condition: 'Good',
    category: 'CABINET',
    images: getImages(2),
    location: 'Quezon City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 3, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'J&T Express',
    swapWantedCategory: 'SOFA',
    swapWantedDescription: 'Interested in a loveseat or small sofa.'
  },
  {
    title: 'Swap: Decorative Floor Mirror',
    description: 'Tall floor mirror with wooden frame, great condition.',
    condition: 'Excellent',
    category: 'MIRROR',
    images: getImages(1),
    location: 'San Juan City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 1, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'LBC Express',
    swapWantedCategory: 'LAMP',
    swapWantedDescription: 'Looking for a floor lamp or table lamp.'
  },
  {
    title: 'Swap: Table Lamp Set',
    description: 'Pair of matching table lamps, perfect for bedside.',
    condition: 'Good',
    category: 'LAMP',
    images: getImages(1),
    location: 'Mandaluyong City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 2, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'Lalamove',
    swapWantedCategory: 'MIRROR',
    swapWantedDescription: 'Prefer a wall mirror or vanity mirror.'
  },
  {
    title: 'Swap: Vanity Dresser',
    description: 'White vanity dresser with mirror and drawers.',
    condition: 'Good',
    category: 'VANITY',
    images: getImages(2),
    location: 'Parañaque City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'J&T Express',
    swapWantedCategory: 'CHAIRS',
    swapWantedDescription: 'Looking for an office chair or accent chair.'
  },
  {
    title: 'Swap: Floating Shelf Set',
    description: 'Set of 3 floating shelves, easy to install.',
    condition: 'Excellent',
    category: 'SHELVES',
    images: getImages(2),
    location: 'Marikina City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 6, unit: 'months' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'LBC Express',
    swapWantedCategory: 'TABLES',
    swapWantedDescription: 'Interested in a coffee table or side table.'
  },
  {
    title: 'Swap: Artwork Collection',
    description: 'Set of framed artwork pieces, various sizes.',
    condition: 'Good',
    category: 'DECOR',
    images: getImages(1),
    location: 'Pasig City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 1, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'Lalamove',
    swapWantedCategory: 'MIRROR',
    swapWantedDescription: 'Looking for decorative mirrors or wall art.'
  },
  {
    title: 'Swap: Office Chair',
    description: 'Ergonomic office chair with adjustable height.',
    condition: 'Good',
    category: 'CHAIRS',
    images: getImages(2),
    location: 'Makati City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 3, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'J&T Express',
    swapWantedCategory: 'TABLES',
    swapWantedDescription: 'Prefer a desk or work table.'
  },
  {
    title: 'Swap: Dining Table Set',
    description: 'Round dining table with 4 matching chairs.',
    condition: 'Good',
    category: 'TABLES',
    images: getImages(2),
    location: 'Quezon City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 5, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'Lalamove',
    swapWantedCategory: 'SOFA',
    swapWantedDescription: 'Looking for a 2-seater sofa or loveseat.'
  },
  {
    title: 'Swap: Corner Sofa',
    description: 'L-shaped corner sofa, comfortable and spacious.',
    condition: 'Good',
    category: 'SOFA',
    images: getImages(2),
    location: 'Taguig City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'LBC Express',
    swapWantedCategory: 'CABINET',
    swapWantedDescription: 'Interested in a TV cabinet or storage unit.'
  },
  {
    title: 'Swap: TV Cabinet',
    description: 'Modern TV cabinet with storage compartments.',
    condition: 'Excellent',
    category: 'CABINET',
    images: getImages(2),
    location: 'San Juan City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 1, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'J&T Express',
    swapWantedCategory: 'SOFA',
    swapWantedDescription: 'Looking for a sectional sofa or loveseat.'
  },
  {
    title: 'Swap: Full Length Mirror',
    description: 'Tall full-length mirror with wooden frame.',
    condition: 'Good',
    category: 'MIRROR',
    images: getImages(1),
    location: 'Mandaluyong City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 3, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'Lalamove',
    swapWantedCategory: 'LAMP',
    swapWantedDescription: 'Prefer a floor lamp or pendant light.'
  },
  {
    title: 'Swap: Pendant Light Set',
    description: 'Set of 3 pendant lights, modern design.',
    condition: 'Good',
    category: 'LAMP',
    images: getImages(1),
    location: 'Parañaque City, Metro Manila',
    status: 'listed',
    material: 'steel',
    age: { value: 2, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'LBC Express',
    swapWantedCategory: 'MIRROR',
    swapWantedDescription: 'Looking for bathroom mirror or vanity mirror.'
  },
  {
    title: 'Swap: Makeup Vanity',
    description: 'Complete makeup vanity with mirror and storage.',
    condition: 'Good',
    category: 'VANITY',
    images: getImages(2),
    location: 'Marikina City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 2, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'J&T Express',
    swapWantedCategory: 'CHAIRS',
    swapWantedDescription: 'Interested in dining chairs or accent chairs.'
  },
  {
    title: 'Swap: Bookcase Unit',
    description: 'Tall bookcase with adjustable shelves.',
    condition: 'Good',
    category: 'SHELVES',
    images: getImages(2),
    location: 'Pasig City, Metro Manila',
    status: 'listed',
    material: 'wood',
    age: { value: 4, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'Lalamove',
    swapWantedCategory: 'TABLES',
    swapWantedDescription: 'Looking for a dining table or coffee table.'
  },
  {
    title: 'Swap: Ceramic Vase Set',
    description: 'Set of decorative ceramic vases, various sizes.',
    condition: 'Excellent',
    category: 'DECOR',
    images: getImages(1),
    location: 'Quezon City, Metro Manila',
    status: 'listed',
    material: 'plastic',
    age: { value: 1, unit: 'years' },
    listedAs: 'swap',
    mode_of_payment: 'cash',
    courier: 'LBC Express',
    swapWantedCategory: 'MIRROR',
    swapWantedDescription: 'Prefer wall mirrors or decorative mirrors.'
  }
];

async function cleanAndAddMoreProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hard cleanup: remove ALL products with external images or unintended categories
    const unintended = ['DINING FURNITURE', 'STORAGE FURNITURE', 'LIVING ROOM FURNITURE', 'OFFICE FURNITURE', 'BEDROOM FURNITURE'];
    const titlePatterns = [/Item/i, /Testing/i, /Barbeque/i, /Painting/i, /Nakikita/i];

    const delRes = await Product.deleteMany({
      $or: [
        { category: { $in: unintended } },
        { title: { $in: titlePatterns } },
        { images: { $elemMatch: { $regex: '^https?://' } } } // Remove ALL external images
      ]
    });
    console.log(`Removed products (unintended/test/external images): ${delRes.deletedCount}`);

    // Find verified sellers
    const verifiedSellers = await User.aggregate([
      { $lookup: { from: 'sellerprofiles', localField: '_id', foreignField: 'userId', as: 'sellerProfile' } },
      { $match: { role: 'seller', 'sellerProfile.status': 'approved' } }
    ]);

    if (verifiedSellers.length === 0) {
      throw new Error('No verified sellers found. Please approve at least one seller.');
    }

    // Add new products using only original categories and local images
    for (const p of newProducts) {
      if (!ORIGINAL_CATEGORIES.includes(p.category)) continue;
      const owner = verifiedSellers[Math.floor(Math.random() * verifiedSellers.length)];
      const item = new Product({ ...p, owner: owner._id });
      await item.save();
      console.log(`Added: ${item.title} (${item.category}) → ${owner.email}`);
    }

    console.log('Seeding completed with local-only images.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanAndAddMoreProducts();
