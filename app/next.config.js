/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // Matching all API routes
          source: "/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
            { key: "X-Frame-Options", value: "ALLOWALL" },
            { key: "Content-Security-Policy", value: "frame-ancestors *" }
          ]
        }
      ]
    },
    reactStrictMode: true,
  }
  
  module.exports = nextConfig