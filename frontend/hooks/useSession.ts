"use client";

import { createSession, getCurrentSession } from "@/app/(api)/session";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateSession() {
  return useMutation({
    mutationFn: async (tableId: string) => {
      const data = await createSession(tableId);
      // Session is now stored in HTTP-only cookie - no localStorage needed
      return data;
    },
  });
}

export function useGetSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => getCurrentSession(),
    retry: false, // Don't retry if no session
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
