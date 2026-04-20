"use client";

import { getRestaurantInfo } from "@/app/(api)/getRestaurantInfo";
import { useQuery } from "@tanstack/react-query";

export function useRestaurantInfo() {
  return useQuery({
    queryKey: ["restaurantInfo"],
    queryFn: getRestaurantInfo,
    staleTime: Infinity,
  });
}
