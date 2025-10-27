const mongoose = require('mongoose');
require('dotenv').config();

const ProductSchema = new mongoose.Schema({
  status: { type: String, enum: ['sold', 'for_approval', 'listed'] },
  title: String,
  price: Number,
  category: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function markProductsSold(limit = 10) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get listed products
    const listed = await Product.aggregate([
      { $match: { status: 'listed' } },
      { $sample: { size: limit } },
      { $project: { _id: 1 } },
    ]);

    if (listed.length === 0) {
      console.log('No listed products found. Nothing to mark as sold.');
      return;
    }

    const ids = listed.map(p => p._id);
    const res = await Product.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { status: 'sold' },
        $currentDate: { updatedAt: true }
      }
    );

    console.log(`Marked ${res.modifiedCount} product(s) as sold.`);

    const updated = await Product.find({ _id: { $in: ids } }).select('title status price category').lean();
    updated.forEach(p => console.log(`- ${p.title} (${p.category}) → ${p.status} ${typeof p.price === 'number' ? `₱${p.price}` : ''}`));
  } catch (e) {
    console.error('Error marking products as sold:', e);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Allow passing a limit via CLI: node markProductsSold.js 12
const arg = Number(process.argv[2]);
const limit = Number.isFinite(arg) && arg > 0 ? Math.floor(arg) : 10;
markProductsSold(limit);
