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

    onSuccess: () => {
      clearCart();

      toast.success("Order placed successfully!");
      router.push("/active");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to place order");
    },
  });
}
