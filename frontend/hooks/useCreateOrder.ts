"use client";

import { useCartStore } from "@/store/cartStore";
import { createOrder, CreateOrderPayload } from "@/app/(api)/createOrder";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateOrder() {
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),

    onSuccess: () => {
      clearCart();
      localStorage.removeItem("cart-storage");
      toast.success("Order placed successfully!");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to place order");
    },
  });
}
