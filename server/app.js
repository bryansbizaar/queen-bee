import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/product.routes.js";
import stripeRouter from "./routes/stripe.routes.js";
import orderRouter from "./routes/order.routes.js";
import shippingRouter from "./routes/shipping.routes.js";
import contactRouter from "./routes/contact.routes.js";
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

// API Routes
app.use("/api/products", productsRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/orders", orderRouter);
app.use("/api/shipping", shippingRouter);
app.use("/api/contact", contactRouter);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Debug route for contact testing
app.get("/api/contact-test", (req, res) => {
  res.json({ 
    message: "Contact test route working", 
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build (production only)
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));
  
  // Handle React routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // Development mode - just show API message
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to Queen Bee Candles API - Development Mode" });
  });
}

// 404 handler for undefined API routes
app.use("/api/*", notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
