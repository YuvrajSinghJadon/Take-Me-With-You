import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
//securty packges
import helmet from "helmet";
import dbConnection from "./dbConfig/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./routes/index.js";
import { createServer } from "http"; // Import HTTP server to use with Socket.IO
import { initializeSocket } from "./webSockets/socket.js"; // Import Socket.IO setup

const __dirname = path.resolve(path.dirname(""));

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "views/build")));

const server = createServer(app); // Create HTTP server
const PORT = process.env.PORT || 8800;

dbConnection();

app.use(helmet());

// Define a list of allowed origins
const allowedOrigins = [
  "http://127.0.0.1:5173", // Vite frontend
  "http://localhost:5173", // Alternative localhost frontend
  "https://take-me-with-ab1weo33i-yuvrajsinghjadons-projects.vercel.app",
  "https://take-me-with-c4678vcl0-yuvrajsinghjadons-projects.vercel.app", // Add other Vercel deployment URLs as needed
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith("vercel.app")
      ) {
        // Allow all Vercel subdomains or explicitly allowed origins
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    }, // Vercel frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Allows cookies, authentication, etc.
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(router);

// Initialize the Socket.IO server
initializeSocket(server);

//error middleware
app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
