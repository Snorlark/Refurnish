import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";

import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(express.json());

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
