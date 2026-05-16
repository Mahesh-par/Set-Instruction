import { loadEnv } from "./loadEnv.js";

loadEnv();

const requiredEnvVars = ["PORT", "MONGO_URI"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const port = Number(process.env.PORT);

if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT must be a valid positive number");
}

export const env = {
  PORT: port,
  MONGO_URI: process.env.MONGO_URI as string,
  NODE_ENV: process.env.NODE_ENV ?? "development"
} as const;
