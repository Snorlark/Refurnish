import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

//Feature routes imports

const app = express();

//Middleware
app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Refurnish E-commerce API is running");
});

//API routes registration

//Socket.io setup
const server = http.createServer(app);
const io = new SocketIOServer(server);

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
