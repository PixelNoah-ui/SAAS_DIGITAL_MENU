"use client";

import { useQuery } from "@tanstack/react-query";
import { scanTableApi } from "@/app/(api)/scanTable";

export const useScanTable = (qrToken: string) => {
  return useQuery({
    queryKey: ["scan-table", qrToken],

    queryFn: () => scanTableApi(qrToken),

    enabled: !!qrToken,

    retry: false,
  });
};
