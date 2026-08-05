import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// Detect if running in GitHub Codespaces
const isCodespaces = !!process.env.CODESPACE_NAME;

export default defineConfig(({ mode }) => {
  const baseConfig: any = {
    server: {
      host: "0.0.0.0",
      port: 8080,
      cors: {
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
      }
    },
  };

  // For Codespaces, configure HMR to connect through the forwarded domain
  if (isCodespaces) {
    baseConfig.server.hmr = `${process.env.CODESPACE_NAME}-8080.app.github.dev`;
  }

  return {
    ...baseConfig,
    plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.png', 'app-icon-white.png', 'robots.txt'],
      manifest: {
        name: 'Edura - Advanced CBT Exam Platform',
        short_name: 'Edura CBT',
        description: 'Nigeria\'s premier Computer-Based Test (CBT) platform for JAMB, WAEC, NECO, and Post-UTME preparation',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/app-icon-white.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Increase cache size limit to 10 MB for large bundle
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-pages',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/zqapbmllkywsuywpfava\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/~oauth/]
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and core libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          // Chart/visualization libraries
          'vendor-charts': ['recharts'],
          // PDF and canvas utilities
          'vendor-pdf': ['jspdf', 'html2canvas', 'react-pdf', 'pdfjs-dist', 'jspdf-autotable'],
          // Math rendering
          'vendor-math': ['katex'],
          // Supabase and backend utilities
          'vendor-supabase': ['@supabase/supabase-js'],
          // Form, validation, and query libraries
          'vendor-query': ['@tanstack/react-query'],
          'vendor-zod': ['zod'],
          'vendor-toast': ['sonner'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
};
});
