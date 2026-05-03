"use client";

import { useCartStore } from "@/store/cartStore";
import { createOrder, CreateOrderPayload } from "@/app/(api)/createOrder";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCreateOrder() {
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),

    onSuccess: (_, variables) => {
      clearCart();
      localStorage.removeItem("cart-storage");

      // Store sessionToken for active page (consistent with useSession)
      if (variables.sessionToken) {
        const sessionData = {
          sessionToken: variables.sessionToken,
          tableId: variables.tableId,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min default
        };
        sessionStorage.setItem("session", JSON.stringify(sessionData));
      }

      toast.success("Order placed successfully!");
      router.push("/active");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to place order");
    },
  });
}
