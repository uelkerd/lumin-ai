/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@types": fileURLToPath(new URL("./src/types", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
    },
  },
  server: {
    port: 3001,
    host: true,
    hmr: {
      overlay: false
    }
  },
  build: {
    outDir: "build",
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts', 'd3', 'chart.js', 'react-chartjs-2'],
          'animation-vendor': ['framer-motion'],
          'utils-vendor': ['axios', 'dompurify'],
          // Feature-based chunks
          'dashboard': [
            './src/components/Dashboard/Dashboard.tsx',
            './src/components/GovernanceMetrics/MetricCard.tsx'
          ],
          'visualization': [
            './src/components/DataVisualization/TrustTrendChart.tsx',
            './src/components/DataVisualization/SentimentAnalysis.tsx',
            './src/components/DataVisualization/DemographicComparison.tsx'
          ],
          'governance': [
            './src/components/GovernanceMetrics/TrustMetrics.tsx',
            './src/components/GovernanceMetrics/DemographicAnalysis.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios'
    ],
    exclude: [
      // Exclude heavy libraries that should be lazy loaded
      'recharts',
      'd3',
      'framer-motion'
    ]
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    }
  },
});