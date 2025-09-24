import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/product.routes.js";
import stripeRouter from "./routes/stripe.routes.js";
import orderRouter from "./routes/order.routes.js";

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT) || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images from the public/images directory
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/api/products", productsRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/orders", orderRouter);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Queen Bee Candles API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Added error handling for the server
const server = app
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Trying port ${port + 1}`);
      server.listen(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
