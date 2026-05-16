import path from "node:path";

import dotenv from "dotenv";

export const loadEnv = (): void => {
  dotenv.config({
    path: [
      path.resolve(process.cwd(), ".env"),
      path.resolve(process.cwd(), "src/.env")
    ]
  });
};
