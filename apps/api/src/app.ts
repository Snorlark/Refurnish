import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Feature routes imports
import userRoutes from "./modules/users/routes/user.route";
import productRoutes from "./modules/products/routes/products.route";
import siteVisitRoutes from "./modules/site-visits/routes/site-visits.route";
import cartRoutes from "./modules/carts/routes/cart.routes";
import wishlistRoutes from "./modules/wishlists/routes/wishlist.routes";
import sellerProfileRoutes from "./modules/users/routes/seller-profile.route";
import messagesRoutes from "./modules/messages/routes/messages.route";
import adminRoutes from "./modules/admin/routes/admin.route";
import contentRoutes from "./modules/content/routes/content.route";
import trackOrderRoutes from "./modules/trackorders/routes/trackorder.routes";
import swapRoutes from "./modules/swaps/routes/swap.routes";

const app = express();

//Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Local development
      "http://localhost:3001", // Alternative local port
      "https://refurnish.vercel.app", // Production Vercel domain
      "https://refurnish-blond.vercel.app", // Alternative Vercel domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Refurnish E-commerce API is running");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Refurnish E-commerce API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

//Socket.io setup
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://refurnish.vercel.app",
      "https://refurnish-blond.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Middleware to attach io to requests
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

//API routes registration
app.use("/api/users", userRoutes);
// Expose seller endpoints under two prefixes for compatibility
app.use("/api/seller", sellerProfileRoutes);
app.use("/api/users/seller", sellerProfileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/site-visits", siteVisitRoutes);
app.use("/api/chat", messagesRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/orders", trackOrderRoutes);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on("send_message", (message) => {
    // Broadcast only to the specific conversation room
    const roomId = message.chatId || message.conversationId;
    if (roomId) {
      io.to(roomId).emit("receive_message", message);
    }
  });

  // Seller dashboard events
  socket.on("join_seller_dashboard", (userId) => {
    socket.join(`seller_${userId}`);
    console.log(`Seller ${userId} joined dashboard`);
  });

  socket.on("join_admin_dashboard", () => {
    socket.join("admin_dashboard");
    console.log(`Admin joined dashboard`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { app, httpServer, io };
