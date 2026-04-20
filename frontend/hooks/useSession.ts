"use client";

import { createSession } from "@/app/(api)/CreateSession";
import { useMutation } from "@tanstack/react-query";

export function useCreateSession() {
  return useMutation({
    mutationFn: (tableId: string) => createSession(tableId),

    onSuccess: (data, tableId) => {
      const sessionData = {
        sessionToken: data.data.session.sessionToken,
        tableId,
        expiresAt: data.data.session.expiresAt,
      };

      sessionStorage.setItem("session", JSON.stringify(sessionData));
    },

    onError: (error) => {
      console.error("Session error:", error.message);
    },
  });
}
