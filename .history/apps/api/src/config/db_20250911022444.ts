import mongoose from "mongoose";
import config from "./config";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
