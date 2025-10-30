import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create pool configuration
// Support both DATABASE_URL (Render/production) and individual variables (local Docker)
let poolConfig;

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL from Render
  console.log("🔗 Using DATABASE_URL for connection");
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Local development: Use individual environment variables
  console.log("🔗 Using individual DATABASE_* variables for connection");
  poolConfig = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// Create a connection pool
const pool = new Pool(poolConfig);

// Test the connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("📊 Query executed:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("❌ Database query error:", error);
    throw error;
  }
};

// Helper function to get a client from the pool (for transactions)
export const getClient = () => {
  return pool.connect();
};

// Graceful shutdown
export const closePool = () => {
  return pool.end();
};

pool
  .connect()
  .then((client) => {
    console.log("🔌 Database connection test successful");
    console.log("Connected to database:", client.database);
    client.release();
  })
  .catch((err) => {
    console.error("❌ Database connection test failed:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Connection details attempted:", {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
    });
  });

export default pool;
