import {
  getNotionClient,
  getNotionClaudeProjectUrlColumnName,
  getNotionClientNameColumnName,
  getNotionDataSourceId,
  getNotionDatabaseId,
  getNotionNameColumnName,
  getNotionUrlColumnName
} from "../config/notion.js";
import { NotionRowsCacheModel } from "../models/notionRowsCacheModel.js";
import { ApiError } from "../utils/ApiError.js";

type NotionPageProperty = {
  type?: string;
  url?: string | null;
  number?: number | null;
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
};

type NotionPageLike = {
  id: string;
  properties?: Record<string, NotionPageProperty>;
};

export type NotionUrlRow = {
  pageId: string;
  name: number | string | null;
  clientName: string | null;
  url: string;
  claudeProjectUrl: string | null;
};

type NotionRowsCacheResult = {
  rows: NotionUrlRow[];
  fetchedAt: Date | null;
  source: "cache" | "notion";
};

const NOTION_ROWS_CACHE_KEY = "notion-url-rows-v2";

const isNotionPageLike = (value: unknown): value is NotionPageLike => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id: unknown }).id === "string" &&
    "properties" in value
  );
};

const getTextFromProperty = (
  property: NotionPageProperty | undefined
): string | null => {
  if (!property) {
    return null;
  }

  if (property.type === "title") {
    return property.title?.map((item) => item.plain_text ?? "").join("") || null;
  }

  if (property.type === "rich_text") {
    return (
      property.rich_text?.map((item) => item.plain_text ?? "").join("") || null
    );
  }

  return null;
};

const getUrlFromProperty = (
  property: NotionPageProperty | undefined
): string | null => {
  if (!property) {
    return null;
  }

  if (property.type === "url") {
    return property.url || null;
  }

  return getTextFromProperty(property);
};

const getNumberFromProperty = (
  property: NotionPageProperty | undefined
): number | string | null => {
  if (!property) {
    return null;
  }

  if (property.type === "number") {
    return property.number ?? null;
  }

  return getTextFromProperty(property);
};

const compareNameValues = (
  firstValue: number | string | null,
  secondValue: number | string | null
): number => {
  const firstText = String(firstValue ?? "");
  const secondText = String(secondValue ?? "");
  const firstNumber = Number(firstText);
  const secondNumber = Number(secondText);

  if (!Number.isNaN(firstNumber) && !Number.isNaN(secondNumber)) {
    return firstNumber - secondNumber;
  }

  return firstText.localeCompare(secondText, undefined, {
    numeric: true,
    sensitivity: "base"
  });
};

const resolveDataSourceId = async (): Promise<string> => {
  const configuredDataSourceId = getNotionDataSourceId();

  if (configuredDataSourceId) {
    return configuredDataSourceId;
  }

  const notion = getNotionClient();
  const database = await notion.databases.retrieve({
    database_id: getNotionDatabaseId()
  });
  const dataSources = (database as { data_sources?: Array<{ id: string }> })
    .data_sources;
  const dataSourceId = dataSources?.[0]?.id;

  if (!dataSourceId) {
    throw new ApiError(
      500,
      "Could not find a Notion data source for NOTION_DATABASE_ID."
    );
  }

  return dataSourceId;
};

export const fetchNotionUrlRows = async (): Promise<NotionUrlRow[]> => {
  const notion = getNotionClient();
  const dataSourceId = await resolveDataSourceId();
  const urlColumnName = getNotionUrlColumnName();
  const claudeProjectUrlColumnName = getNotionClaudeProjectUrlColumnName();
  const clientNameColumnName = getNotionClientNameColumnName();
  const nameColumnName = getNotionNameColumnName();
  const rows: NotionUrlRow[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
      result_type: "page",
      sorts: [
        {
          property: nameColumnName,
          direction: "ascending"
        }
      ]
    });

    for (const result of response.results) {
      if (!isNotionPageLike(result)) {
        continue;
      }

      const url = getUrlFromProperty(result.properties?.[urlColumnName]);
      const claudeProjectUrl = getUrlFromProperty(
        result.properties?.[claudeProjectUrlColumnName]
      );
      const name = getNumberFromProperty(result.properties?.[nameColumnName]);

      if (!url || name === null || String(name).trim() === "") {
        continue;
      }

      rows.push({
        pageId: result.id,
        name,
        clientName: getTextFromProperty(
          result.properties?.[clientNameColumnName]
        ),
        url,
        claudeProjectUrl
      });
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return rows.sort((firstRow, secondRow) =>
    compareNameValues(firstRow.name, secondRow.name)
  );
};

const getCachedNotionUrlRows = async (): Promise<
  Omit<NotionRowsCacheResult, "source">
> => {
  const cache = await NotionRowsCacheModel.findOne({
    key: NOTION_ROWS_CACHE_KEY
  }).lean<{
    rows?: NotionUrlRow[];
    fetchedAt?: Date;
  }>();

  return {
    rows: cache?.rows ?? [],
    fetchedAt: cache?.fetchedAt ?? null
  };
};

const saveNotionUrlRowsCache = async (
  rows: NotionUrlRow[]
): Promise<Omit<NotionRowsCacheResult, "source">> => {
  const fetchedAt = new Date();

  await NotionRowsCacheModel.findOneAndUpdate(
    {
      key: NOTION_ROWS_CACHE_KEY
    },
    {
      key: NOTION_ROWS_CACHE_KEY,
      rows,
      fetchedAt
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return {
    rows,
    fetchedAt
  };
};

export const getNotionUrlRows = async (
  forceRefresh = false
): Promise<NotionRowsCacheResult> => {
  if (!forceRefresh) {
    const cache = await getCachedNotionUrlRows();

    if (cache.rows.length > 0) {
      return {
        ...cache,
        source: "cache"
      };
    }
  }

  const rows = await fetchNotionUrlRows();
  const cache = await saveNotionUrlRowsCache(rows);

  return {
    ...cache,
    source: "notion"
  };
};
