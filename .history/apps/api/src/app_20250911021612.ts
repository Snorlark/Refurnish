import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

//Feature routes imports

const app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
