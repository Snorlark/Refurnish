import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  role: 'buyer' | 'seller' | 'admin';
  googleId?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  contactNumber?: string;
  address?: string;
  birthday?: Date;
  gender?: 'male' | 'female' | 'other';
  customGender?: string;
  lastActive?: Date;
  isOnline?: boolean;
  followers?: string[];
  following?: string[];
  followerCount?: number;
  followingCount?: number;
  followersPublic?: boolean;
  followingPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
  generateAuthToken(): string;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: function() { return !this.googleId; }, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: function() { return !this.googleId; } },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  contactNumber: { type: String },
  address: { type: String },
  birthday: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], required: false },
  customGender: { type: String },
  lastActive: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  followersPublic: { type: Boolean, default: true },
  followingPublic: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  const user = this as unknown as IUser;
  if (!user.isModified("password") || !user.password) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { 
      _id: this._id, 
      email: this.email, 
      role: this.role,
      firstName: this.firstName,
      lastName: this.lastName || ''
    }, 
    process.env.JWT_SECRET as string, 
    {
      expiresIn: "24h",
    }
  );
  return token;
};

export default mongoose.model<IUser>("User", UserSchema);
