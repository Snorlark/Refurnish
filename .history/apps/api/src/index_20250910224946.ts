import * as express from "express";
import * as http from "http";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as compression from "compression";
import * as cors from "cors";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

// const PORT = process.env.PORT || 8080;

server.listen(8080, () => {
  console.log(`Server is running on http://localhost:8080`);
});
