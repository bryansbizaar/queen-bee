import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/product.routes.js";
import stripeRouter from "./routes/stripe.routes.js";
import orderRouter from "./routes/order.routes.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

// Health check route for tests
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
