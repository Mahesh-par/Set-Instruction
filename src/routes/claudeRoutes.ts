import { Router } from "express";

import {
  getInstruction,
  openInstructions,
  saveInstructionText
} from "../controllers/claudeController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/instructions", asyncHandler(getInstruction));
router.put("/instructions", asyncHandler(saveInstructionText));
router.post("/instructions/open", asyncHandler(openInstructions));

export default router;
