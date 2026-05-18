import { Router } from "express";

import { getNotionUrls } from "../controllers/notionController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/urls", asyncHandler(getNotionUrls));

export default router;
