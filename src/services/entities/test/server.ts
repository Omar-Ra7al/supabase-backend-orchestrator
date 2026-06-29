"use server";

import { testService } from "./core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTest = async (payload: any) => {
  return await testService.create({ payload });
};
