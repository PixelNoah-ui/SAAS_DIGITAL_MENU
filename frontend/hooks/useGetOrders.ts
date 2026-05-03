"use client";

import { getOrders, GetOrdersResponse } from "@/app/(api)/getOrders";
import { useQuery } from "@tanstack/react-query";

export function useGetOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });
}
