import { httpServer } from "../app";
import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 8080,
  mongoURI: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
};

export default config;
