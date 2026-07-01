"use client";

import { useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { generateFeatureService } from "./core";
// import { YourSchemaType } from "@/schemas/yourSchema";

/**
 * Copy to `services/entities/your-feature/client.ts` and replace placeholders.
 *
 * For instant UI updates in client components. Prefer server actions for most writes.
 */
export const useFeatureService = () => {
  const browserClient = useMemo(() => createBrowserClient(), []);

  const service = useMemo(
    () => generateFeatureService(browserClient),
    [browserClient],
  );

  // const createFeature = (payload: YourSchemaType) =>
  //   service.create({ payload });

  return {
    service,
    // createFeature,
  };
};
