import { spawn } from "node:child_process";

import {
  getChromeExecutablePath,
  getChromeSessionDir,
  getClaudeLoginUrl
} from "../config/browserSession.js";
import { loadEnv } from "../config/loadEnv.js";

loadEnv();

const loginClaude = async (): Promise<void> => {
  const executablePath = getChromeExecutablePath();
  const userDataDir = getChromeSessionDir();
  const loginUrl = getClaudeLoginUrl();

  console.log("Opening normal Chrome for Claude login...");
  console.log(`Session directory: ${userDataDir}`);

  const chrome = spawn(
    executablePath,
    [
      `--user-data-dir=${userDataDir}`,
      "--profile-directory=Default",
      "--new-window",
      "--no-first-run",
      "--no-default-browser-check",
      loginUrl
    ],
    {
      detached: false,
      stdio: "ignore"
    }
  );

  console.log("Login in the opened Chrome window using Google or email.");
  console.log(
    "Close Chrome when you are done. The session will be saved automatically."
  );

  await new Promise<void>((resolve, reject) => {
    chrome.once("error", reject);
    chrome.once("close", () => resolve());
  });

  console.log("Claude Chrome session saved.");
};

loginClaude().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown login error";

  console.error("Claude login failed:", message);
  process.exit(1);
});
