"use client";

import { getOrdersBySession } from "@/app/(api)/getOrdersBySession";
import { useQuery } from "@tanstack/react-query";

export function useGetOrdersBySession(sessionToken: string) {
  return useQuery({
    queryKey: ["orders", sessionToken],
    queryFn: () => getOrdersBySession(sessionToken),
    enabled: !!sessionToken,
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });
}
