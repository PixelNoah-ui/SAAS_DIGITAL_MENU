"use client";

import { getAllOrders } from "@/app/(api)/getOrders";
import { useQuery } from "@tanstack/react-query";

export const useAllOrders = (filters: {
  page?: number;
  status?: string[];
  date_from?: string;
  date_to?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: ["all-orders", filters],
    queryFn: () => getAllOrders(filters),
    refetchInterval: 30000, // Poll every 30 seconds for updates
  });
};
