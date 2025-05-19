import { instance } from ".";
import type { AskResult } from "../types/ask";

export const getAsk = async (audio: string) => {
  const result = await instance.post<AskResult>("/huggingFace/ask", { audio });
  return result.data;
};
