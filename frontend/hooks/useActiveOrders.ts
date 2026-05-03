"use client";

import { getActiveOrders } from "@/app/(api)/getOrders";
import { useQuery } from "@tanstack/react-query";

export const useActiveOrders = () => {
  return useQuery({
    queryKey: ["active-orders"],
    queryFn: getActiveOrders,
    refetchInterval: 3000,
  });
};
