"use client";

import EmptyCart from "@/components/EmptyCart";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { SessionResponse } from "@/app/(api)/CreateSession";
import { Trash, Loader2 } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "@/app/(api)/CreateSession";
import { useTableStore } from "@/store/tableStore";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, increaseQty, decreaseQty } = useCartStore();
  const { mutate: createOrder, isPending: isOrderLoading } = useCreateOrder();
  const router = useRouter();

  const { mutate: createSessionMutation, isPending: isSessionLoading } =
    useMutation({
      mutationFn: createSession,
    });
  const table = useTableStore((state) => state.table);

  const isLoading = isOrderLoading || isSessionLoading;

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleOrder = () => {
    if (!table) {
      console.error("No table found");
      return;
    }

    // Create session first, then order
    createSessionMutation(table.id, {
      onSuccess: (data: SessionResponse) => {
        const newSession = {
          sessionToken: data.data.session.sessionToken,
          tableId: data.data.session.tableId,
          expiresAt: data.data.session.expiresAt,
        };

        const orderItems = items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        }));

        createOrder(
          {
            tableId: newSession.tableId,
            items: orderItems,
            sessionToken: newSession.sessionToken,
          },
          {
            onSuccess: () => {
              // STEP 3: redirect to active page
              router.push(`/active`);
            },
          },
        );
      },

      onError: (error: Error) => {
        console.error("Failed to create session:", error.message);
      },
    });
  };

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:px-8 lg:px-10 bg-background text-foreground">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT SIDE CART */}
        <div className="w-full lg:basis-3/5 bg-card border border-border">
          {/* Desktop Header */}
          <div className="hidden md:grid bg-muted py-4 px-4 grid-cols-13 text-sm font-semibold text-muted-foreground">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 mr-6 text-right">Total</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* Cart Items */}
          <div className="max-h-105 border-y border-border overflow-y-auto no-scrollbar">
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-13 gap-4 p-4 items-center"
                >
                  <div className="md:col-span-6 flex gap-4 items-center">
                    <div className="relative w-20 h-20 shrink-0">
                      <Image
                        src={item.imageUrl || "/images/bg.png"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base flex-1">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-destructive text-sm mt-2 md:hidden ml-auto"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  <div className="md:col-span-2 flex justify-between md:justify-center text-sm">
                    <span className="md:hidden font-medium">Price</span>
                    <span>
                      {item.price} <span className="text-primary">ETB</span>
                    </span>
                  </div>

                  <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                    <span className="md:hidden font-medium">Qty</span>
                    <div className="flex items-center border border-border bg-background">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="px-3 py-1 hover:bg-muted"
                      >
                        -
                      </button>
                      <span className="w-10 text-center">{item.quantity}</span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="px-3 py-1 hover:bg-muted"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                    <span className="md:hidden font-medium">Total</span>
                    <div>
                      {item.price * item.quantity}{" "}
                      <span className="text-primary">ETB</span>
                    </div>
                  </div>

                  <div className="hidden md:flex md:col-span-1 justify-end">
                    <Trash
                      onClick={() => removeItem(item.id)}
                      className="text-destructive cursor-pointer"
                      size={18}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE SUMMARY */}
        <div className="w-full lg:basis-2/5 border border-border bg-card h-fit lg:sticky lg:top-24 flex flex-col">
          <h2 className="text-center text-2xl font-bold capitalize bg-muted py-4">
            Cart Summary
          </h2>

          <div className="space-y-4 px-6 py-6 text-sm flex-1">
            <div className="flex justify-between">
              <span className="font-medium text-lg uppercase">Subtotal</span>
              <div>
                {subtotal.toFixed(2)} <span className="text-primary">ETB</span>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex justify-between font-semibold text-lg">
              <span className="uppercase">Total</span>
              <div>
                {subtotal.toFixed(2)} <span className="text-primary">ETB</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full py-6 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Order"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
