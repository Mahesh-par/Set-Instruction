import { Schema, model } from "mongoose";

const notionRowSchema = new Schema(
  {
    pageId: {
      type: String,
      required: true
    },
    name: {
      type: Schema.Types.Mixed,
      default: null
    },
    clientName: {
      type: String,
      default: null
    },
    url: {
      type: String,
      required: true
    },
    claudeProjectUrl: {
      type: String,
      default: null
    }
  },
  {
    _id: false
  }
);

const notionRowsCacheSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    rows: {
      type: [notionRowSchema],
      default: []
    },
    fetchedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const NotionRowsCacheModel = model(
  "NotionRowsCache",
  notionRowsCacheSchema
);
