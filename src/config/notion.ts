import { Client } from "@notionhq/client";

import { ApiError } from "../utils/ApiError.js";

export const getNotionClient = (): Client => {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    throw new ApiError(500, "NOTION_API_KEY is missing in environment.");
  }

  return new Client({
    auth: apiKey
  });
};

export const getNotionDatabaseId = (): string => {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new ApiError(500, "NOTION_DATABASE_ID is missing in environment.");
  }

  return databaseId;
};

export const getNotionDataSourceId = (): string | null => {
  return process.env.NOTION_DATA_SOURCE_ID || null;
};

export const getNotionUrlColumnName = (): string => {
  return process.env.NOTION_URL_COLUMN || "Claude Project URL";
};

export const getNotionClaudeProjectUrlColumnName = (): string => {
  return process.env.NOTION_CLAUDE_PROJECT_URL_COLUMN || "Claude Project URL";
};

export const getNotionClientNameColumnName = (): string => {
  return process.env.NOTION_CLIENT_NAME_COLUMN || "Client Name";
};

export const getNotionNameColumnName = (): string => {
  return process.env.NOTION_NAME_COLUMN || "Name";
};
