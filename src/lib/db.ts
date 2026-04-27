import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
// Use native WebSocket in Node 22+ (user is on Node 24)
neonConfig.webSocketConstructor = globalThis.WebSocket;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || "";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
};

export const db =
  globalForPrisma.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
