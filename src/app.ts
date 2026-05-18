import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import claudeRoutes from "./routes/claudeRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import notionRoutes from "./routes/notionRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/health", healthRoutes);
app.use("/api/claude", claudeRoutes);
app.use("/api/notion", notionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
