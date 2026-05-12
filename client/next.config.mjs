/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // ─── Image Optimisation ──────────────────────────────────────
  // Cloudinary CDN serves WebP/AVIF automatically.
  // next/image handles lazy loading + blur placeholder.
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com", // YouTube thumbnails
        pathname: "/**",
      },
    ],
    // Serve modern formats — critical for low-bandwidth Nigerian users
    formats: ["image/avif", "image/webp"],
    // Device sizes matching Infinix/Tecno common resolutions
    deviceSizes: [360, 414, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 3600, // 1hr CDN cache on images
  },

  // ─── Compression ─────────────────────────────────────────────
  compress: true,

  // ─── Headers ─────────────────────────────────────────────────
  async headers() {
    return [
      // ── Security headers — always applied ──────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },

      // ── Static asset cache — production only ───────────────
      // In development Next.js manages its own cache headers for
      // hot reload and Fast Refresh to work correctly.
      // Static files are content-hashed so immutable is safe in prod.
      ...(isProd
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
    ];
  },

  // ─── Env exposed to browser ───────────────────────────────────
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  },
};

export default nextConfig;
