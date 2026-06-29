import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Baileys + pino use Node-only APIs; must not be webpack-bundled in Route Handlers.
  serverExternalPackages: ["baileys", "pino", "thread-stream", "@hapi/boom", "qrcode"],
};

export default nextConfig;
