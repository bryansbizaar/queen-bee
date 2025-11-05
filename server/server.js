import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const port = parseInt(process.env.PORT) || 8080;
// Added error handling for the server
const server = app
  .listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Trying port ${port + 1}`);
      server.listen(port + 1, "0.0.0.0");
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
