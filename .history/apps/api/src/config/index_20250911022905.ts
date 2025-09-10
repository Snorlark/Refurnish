import { app, httpServer } from "../app";
import config from "./config";
import connectDB from "./db";

// Connect to the database first, then start the server
connectDB()
  .then(() => {
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
