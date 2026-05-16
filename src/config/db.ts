import mongoose from "mongoose";

import { env } from "./env.js";

export const connectDB = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
