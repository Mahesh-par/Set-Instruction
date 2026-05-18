import { InstructionModel } from "../models/instructionModel.js";

const INSTRUCTION_KEY = "default-instruction";

type SavedInstruction = {
  instruction: string;
  updatedAt: Date | null;
};

export const getSavedInstruction = async (): Promise<SavedInstruction> => {
  const savedInstruction = await InstructionModel.findOne({
    key: INSTRUCTION_KEY
  }).lean<{
    instruction?: string;
    updatedAt?: Date;
  }>();

  return {
    instruction: savedInstruction?.instruction ?? "",
    updatedAt: savedInstruction?.updatedAt ?? null
  };
};

export const saveInstruction = async (
  instruction: string
): Promise<SavedInstruction> => {
  const savedInstruction = await InstructionModel.findOneAndUpdate(
    {
      key: INSTRUCTION_KEY
    },
    {
      key: INSTRUCTION_KEY,
      instruction
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).lean<{
    instruction: string;
    updatedAt: Date;
  }>();

  return {
    instruction: savedInstruction?.instruction ?? instruction,
    updatedAt: savedInstruction?.updatedAt ?? new Date()
  };
};
