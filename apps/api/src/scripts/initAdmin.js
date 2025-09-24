const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

async function initAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@refurnish.dev' });
    
    if (existingAdmin) {
      console.log('Admin account already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin account
    const admin = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@refurnish.dev',
      password: 'Refurnish2024!@#Admin',
      role: 'admin',
      isEmailVerified: true
    });

    await admin.save();
    console.log('Admin account created successfully!');
    console.log('Email: admin@refurnish.dev');
    console.log('Password: Refurnish2024!@#Admin');
    console.log('Admin Secret: REFURNISH_ADMIN_SECRET_2024');

  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

initAdmin();
