import mongoose, { Schema, Document } from "mongoose";

export interface ISiteVisit extends Document {
  ipAddress: string;
  userAgent: string;
  page: string;
  referrer?: string;
  timestamp: Date;
  userId?: mongoose.Schema.Types.ObjectId;
}

const SiteVisitSchema: Schema = new Schema({
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  page: { type: String, required: true },
  referrer: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<ISiteVisit>("SiteVisit", SiteVisitSchema);
