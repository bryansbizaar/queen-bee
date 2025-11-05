import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const apiUrl =
    mode === "production"
      ? "https://queenbeecandles.co.nz/api"
      : "http://localhost:8080/api";

  // IMPORTANT: This is your Stripe publishable key for production
  // If you need to update it, get it from: https://dashboard.stripe.com/test/apikeys
  const stripeKey =
    mode === "production"
      ? "pk_live_51KiUrjF9MElxuMjvO6TbY3SWGKfEyjHA3v9sbf5k6aTNsRLiQkIuDv9ihHTeQPaDb2Kr0536SeWU40Lydkcg6JNX00Blbp0Q0M"
      : import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY ||
        "pk_test_51KiUrjF9MElxuMjviJAW9Uv4u6GiNL3HuovBIm6VTNzJo7deHAlkLyV2I9CyQcVgeB2JsUfRNqtRpg6JJPJlK93m00n4W0mWKp";

  return {
    plugins: [react()],
    define: {
      // Ensure VITE_API_URL is defined at build time
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
      // Ensure VITE_STRIPE_PUBLISHABLE_KEY is defined at build time
      "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(stripeKey),
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/__tests__/setup.js"],
      include: ["src/**/*.{test,spec}.{js,jsx}"],
      exclude: ["node_modules", "dist"],
    },
  };
});
