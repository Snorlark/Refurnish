import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

//Feature routes imports
import userRoutes from "./modules/users/routes/user.route";
import productRoutes from "./modules/products/routes/products.route";

const app = express();

//Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',           // Local development
      'http://localhost:3001',           // Alternative local port
      'https://refurnish.vercel.app',    // Production Vercel domain
      'https://refurnish-blond.vercel.app', // Alternative Vercel domain
      
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Refurnish E-commerce API is running");
});

//API routes registration
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

//Socket.io setup
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://refurnish.vercel.app',
      'https://refurnish-blond.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on("send_message", (message) => {
    // Logic to save message to database
    io.to(message.chatId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { app, httpServer, io };
