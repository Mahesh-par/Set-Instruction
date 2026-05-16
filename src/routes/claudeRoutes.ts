import { Router } from "express";

import { openInstructions } from "../controllers/claudeController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/instructions/open", asyncHandler(openInstructions));

export default router;
