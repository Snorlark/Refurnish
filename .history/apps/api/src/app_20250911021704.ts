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
