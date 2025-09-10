import { app, httpServer } from "../app";
import config from "./config";
import connectDB from "./db";

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
