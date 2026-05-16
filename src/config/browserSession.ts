import fs from "node:fs";
import path from "node:path";

const getChromeCandidates = (): string[] => {
  if (process.platform === "win32") {
    return [
      path.join(
        process.env.PROGRAMFILES ?? "C:\\Program Files",
        "Google\\Chrome\\Application\\chrome.exe"
      ),
      path.join(
        process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)",
        "Google\\Chrome\\Application\\chrome.exe"
      ),
      path.join(
        process.env.LOCALAPPDATA ?? "",
        "Google\\Chrome\\Application\\chrome.exe"
      )
    ];
  }

  if (process.platform === "darwin") {
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      path.join(
        process.env.HOME ?? "",
        "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      )
    ];
  }

  return [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ];
};

export const getChromeExecutablePath = (): string => {
  if (process.env.CHROME_EXECUTABLE_PATH) {
    return process.env.CHROME_EXECUTABLE_PATH;
  }

  const executablePath = getChromeCandidates().find((candidate) =>
    fs.existsSync(candidate)
  );

  if (!executablePath) {
    throw new Error(
      "Chrome executable was not found. Set CHROME_EXECUTABLE_PATH in .env."
    );
  }

  return executablePath;
};

export const getChromeSessionDir = (): string => {
  return path.resolve(
    process.cwd(),
    process.env.CHROME_SESSION_DIR ?? "chrome-session"
  );
};

export const getClaudeLoginUrl = (): string => {
  return process.env.CLAUDE_LOGIN_URL ?? "https://claude.ai/login";
};
