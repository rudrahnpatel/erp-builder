import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Use ws library to avoid unhandled ErrorEvents in Node native WebSocket
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || "";
  const pool = new Pool({ connectionString });
  pool.on("error", (err) => console.error("Neon Pool Error:", err));
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
};

export const db =
  globalForPrisma.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
