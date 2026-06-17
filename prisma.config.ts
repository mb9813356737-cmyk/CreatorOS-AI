import { defineConfig } from "prisma/config";
import fs from "fs";
import path from "path";

// Self-contained loader to ensure environment variables from .env/.env.local are loaded for Prisma CLI
function loadEnv() {
  const envPaths = [".env.local", ".env"];
  for (const envFile of envPaths) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const index = trimmed.indexOf("=");
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          let value = trimmed.substring(index + 1).trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
      break;
    }
  }
}

loadEnv();

// Read environment variables directly to avoid strict validation errors when running locally
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
