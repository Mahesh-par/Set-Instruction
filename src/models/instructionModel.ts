import { Schema, model } from "mongoose";

const instructionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    instruction: {
      type: String,
      required: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const InstructionModel = model("Instruction", instructionSchema);
