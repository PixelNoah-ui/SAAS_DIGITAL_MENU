"use client";

import { useQuery } from "@tanstack/react-query";
import getMenu from "@/app/(api)/getMenu";

export function useGetMenu(id: string) {
  return useQuery({
    queryKey: ["menu", id],
    queryFn: () => getMenu(id),
    enabled: !!id,
  });
}
