import "dotenv/config";
import { config } from "dotenv";
import { existsSync } from "fs";
// .env.local overrides .env (local dev uses non-pooling URL for DDL safety)
if (existsSync(".env.local")) config({ path: ".env.local", override: true });
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
