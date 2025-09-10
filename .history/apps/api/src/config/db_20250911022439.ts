import mongoose from "mongoose";
import config from "./config";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
  }
}
