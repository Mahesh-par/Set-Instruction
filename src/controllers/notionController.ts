import type { Request, Response } from "express";

import { getNotionUrlRows } from "../services/notionService.js";

export const getNotionUrls = async (
  req: Request,
  res: Response
): Promise<void> => {
  const forceRefresh = req.query.refresh === "true";
  const result = await getNotionUrlRows(forceRefresh);

  res.status(200).json({
    success: true,
    message: "Notion URL rows fetched successfully",
    count: result.rows.length,
    source: result.source,
    fetchedAt: result.fetchedAt,
    data: result.rows
  });
};
