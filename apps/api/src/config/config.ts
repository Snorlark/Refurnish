import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 8080,
  mongoURI: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  adminSecret: process.env.ADMIN_SECRET || "REFURNISH_ADMIN_SECRET_2024",
};

export default config;
