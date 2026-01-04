/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const scriptSrc = isProd
      ? "script-src 'self' 'unsafe-inline';"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval';"; // <— autoriser en DEV

    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://open.tiktokapis.com https://open-upload-i18n.tiktokapis.com https://*.tiktokapis.com",
      "frame-ancestors 'none'",
    ].join("; ");

    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: csp },
      ],
    }];
  },
};

module.exports = nextConfig;
