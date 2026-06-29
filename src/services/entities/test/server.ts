"use server";

import { getTestService } from "./core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTest = async (payload: any) => {
  const service = await getTestService();
  return await service.create({ payload });
};
