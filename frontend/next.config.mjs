/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SSR for wallet-related components to avoid indexedDB issues
  reactStrictMode: true,
  headers() {
    // FHEVM requires COOP, but Base Account SDK doesn't allow 'same-origin'
    // Using 'unsafe-none' as a compromise - FHEVM should still work
    return Promise.resolve([
      {
        source: "/",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ]);
  },
};

export default nextConfig;

