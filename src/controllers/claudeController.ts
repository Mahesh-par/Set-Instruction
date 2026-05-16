import type { Request, Response } from "express";

import { openClaudeInstructionsPopup } from "../services/claudeAutomationService.js";
import { ApiError } from "../utils/ApiError.js";

type OpenInstructionsBody = {
  claudeLink?: unknown;
  instruction?: unknown;
};

const validateClaudeLink = (value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "Claude link is required.");
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new ApiError(400, "Claude link must be a valid URL.");
  }

  if (!["claude.ai", "www.claude.ai"].includes(url.hostname)) {
    throw new ApiError(400, "Claude link must be a claude.ai URL.");
  }

  return url.toString();
};

const validateInstruction = (value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "Instruction is required.");
  }

  return value;
};

export const openInstructions = async (
  req: Request<unknown, unknown, OpenInstructionsBody>,
  res: Response
): Promise<void> => {
  const claudeLink = validateClaudeLink(req.body.claudeLink);
  const instruction = validateInstruction(req.body.instruction);

  await openClaudeInstructionsPopup({
    claudeLink,
    instruction
  });

  res.status(200).json({
    success: true,
    message: "Claude instructions saved successfully"
  });
};
