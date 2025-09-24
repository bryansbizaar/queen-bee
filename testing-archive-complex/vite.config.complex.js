import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js", "./src/tests/setup/cartTestSetup.js"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js", "./src/tests/setup/cartTestSetup.js"],
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json", "lcov"],
      reportsDirectory: "coverage",
      exclude: [
        "node_modules/**",
        "src/test/**",
        "src/tests/**",
        "src/**/*.test.{js,jsx}",
        "src/**/*.spec.{js,jsx}",
        "src/main.jsx",
        "vite.config.js",
        "dist/**",
        "public/**",
        "**/*.d.ts",
      ],
      thresholds: {
        global: {
          statements: 85,
          branches: 85,
          functions: 85,
          lines: 85,
        },
        // Specific thresholds for cart functionality
        "src/context/CartContext.jsx": {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        "src/components/Cart.jsx": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "src/components/CartIcon.jsx": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    silent: false,
    reporters: ["default", "verbose"],
    outputFile: {
      junit: "./coverage/junit.xml",
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    env: {
      VITE_API_URL: "http://localhost:3001",
      VITE_STRIPE_PUBLIC_KEY: "pk_test_mock_key_for_testing",
    },
    // Retry failed tests (useful for timing-sensitive cart operations)
    retry: 2,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./src/tests"),
    },
  },
});
