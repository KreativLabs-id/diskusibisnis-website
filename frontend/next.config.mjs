import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },

  // Build configuration
  typescript: {
    // Ignore TypeScript errors during build (temporary fix)
    ignoreBuildErrors: true,
  },

  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },

  // Production build options
  productionBrowserSourceMaps: false,

  // Optimize output for Vercel deployment
  // output: "standalone", // Commented out for Vercel deployment

  // Configure webpack to handle build errors more gracefully
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // Headers for security
  // Based on OWASP Security Headers recommendations
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Build CSP directive
    // Note: CSP is complex, test thoroughly before strict enforcement
    const cspDirectives = [
      "default-src 'self'",
      // Scripts - allow self, Google, and inline for Next.js
      `script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : "'unsafe-inline'"} https://accounts.google.com https://apis.google.com https://www.googletagmanager.com`,
      // Styles - allow self and inline (needed for styled-jsx, emotion, etc.)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Images - allow various sources
      "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://www.gravatar.com https://res.cloudinary.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Connect (API, WebSocket)
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || ''} https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://www.googleapis.com ${isDev ? 'ws://localhost:* http://localhost:*' : ''}`,
      // Frames
      "frame-src 'self' https://accounts.google.com https://www.youtube.com",
      // Objects (disable Flash, Java, etc.)
      "object-src 'none'",
      // Base URI
      "base-uri 'self'",
      // Form targets
      "form-action 'self'",
      // Frame ancestors
      "frame-ancestors 'self'",
      // Upgrade to HTTPS in production
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ];

    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // XSS Protection (legacy but still useful)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // DNS prefetch
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Permissions Policy (formerly Feature-Policy)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Content Security Policy
          // Using Report-Only in development for testing
          {
            key: isDev ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
            value: cspDirectives.join('; '),
          },
          // HSTS - only in production
          ...(isDev ? [] : [{
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          }]),
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

// PWA Configuration
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /\/_next\/static\/chunks\/.*\.js$/,
  ],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  fallbacks: {
    document: '/offline.html',
  },
  manifestTransforms: [
    (manifestEntries) => {
      // Filter out problematic entries
      const manifest = manifestEntries.filter(
        (entry) => !entry.url.includes('chunks/app') && !entry.url.includes('undefined')
      );
      return { manifest };
    },
  ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10 // Fall back to cache if api does not response within 10 seconds
      }
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
});

export default pwaConfig(nextConfig);
