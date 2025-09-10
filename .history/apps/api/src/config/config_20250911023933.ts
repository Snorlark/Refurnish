import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 8080,
  mongoURI: process.env.MONGODB_URI as String,
};

export default config;
