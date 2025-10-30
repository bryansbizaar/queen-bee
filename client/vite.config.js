import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const apiUrl = mode === 'production' 
    ? 'https://queen-bee-candles.onrender.com'
    : 'http://localhost:8080';
  
  console.log(`🏗️  Vite building in ${mode} mode`);
  console.log(`🔗 VITE_API_URL will be: ${apiUrl}`);
  
  return {
    plugins: [react()],
    define: {
      // Ensure VITE_API_URL is defined at build time
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
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