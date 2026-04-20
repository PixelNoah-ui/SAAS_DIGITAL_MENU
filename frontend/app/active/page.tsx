"use client";

import { Bike, CheckCircle2, ChefHat, Package, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpDialog } from "@/components/HelpDialog";
import { useGetOrdersBySession } from "@/hooks/useGetOrdersBySession";
import { getSession } from "@/lib/getSession";
import { ActiveOrderSkeleton } from "@/components/skeletons/ActiveOrderSkeleton";
import EmptyOrder from "@/components/EmptyOrder";

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusStep(status: string) {
  switch (status) {
    case "PENDING":
      return 0;
    case "PREPARING":
      return 1;
    case "READY":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return 0;
  }
}

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: {
    name: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function Page() {
  const session = getSession();
  const { data, isLoading, error } = useGetOrdersBySession(
    session?.sessionToken || "",
  );

  if (!session) {
    return <EmptyOrder />;
  }

  if (isLoading) {
    return <ActiveOrderSkeleton />;
  }

  if (error || !data?.data?.orders?.length) {
    return <EmptyOrder />;
  }

  // Get the most recent active order
  const activeOrder: Order = data.data.orders[0];
  const currentStep = getStatusStep(activeOrder.status);
  const totalItems = activeOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div className="border-t border-muted-foreground px-3 py-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Order {activeOrder.id.slice(-6).toUpperCase()}
          </h2>
          <p className="text-sm text-muted-foreground">
            Placed at {formatTime(activeOrder.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-foreground">
            {Number(activeOrder.totalAmount).toFixed(2)} ETB
          </p>
          <p className="text-sm text-muted-foreground">{totalItems} items</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mt-8">
        {/* Step 1 - Order Received */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full ${
              currentStep >= 0
                ? "border-2 border-primary bg-primary/10"
                : "bg-muted"
            }`}
          >
            <CheckCircle2
              className={
                currentStep >= 0 ? "text-primary" : "text-muted-foreground"
              }
              size={20}
            />
          </div>
          <p className="text-sm mt-2 text-foreground font-medium">Order</p>
          <p className="text-xs text-muted-foreground">Received</p>
        </div>

        {/* Step 2 - Preparing */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full ${
              currentStep >= 1
                ? "border-2 border-primary bg-primary/10"
                : "bg-muted"
            }`}
          >
            <ChefHat
              className={
                currentStep >= 1 ? "text-primary" : "text-muted-foreground"
              }
              size={20}
            />
          </div>
          <p className="text-sm mt-2">Kitchen</p>
          <p className="text-xs text-muted-foreground">Preparing</p>
        </div>

        {/* Step 3 - On the Way */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full ${
              currentStep >= 2
                ? "border-2 border-primary bg-primary/10"
                : "bg-muted"
            }`}
          >
            <Bike
              className={
                currentStep >= 2 ? "text-primary" : "text-muted-foreground"
              }
              size={20}
            />
          </div>
          <p className="text-sm mt-2">On the Way</p>
        </div>

        {/* Step 4 - Delivered */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full ${
              currentStep >= 3
                ? "border-2 border-primary bg-primary/10"
                : "bg-muted"
            }`}
          >
            <Package
              className={
                currentStep >= 3 ? "text-primary" : "text-muted-foreground"
              }
              size={20}
            />
          </div>
          <p className="text-sm mt-2">Delivered</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-6" />

      {/* Order Details */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-foreground mb-2">
          ORDER DETAILS
        </h3>

        {activeOrder.items.map((item) => (
          <p key={item.id} className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {item.quantity}x
            </span>{" "}
            {item.menuItem?.name || `Item #${item.menuItemId}`}
          </p>
        ))}
      </div>

      {/* Help Button */}
      <div className="mt-6">
        <HelpDialog>
          <Button variant="outline" className="w-full gap-2">
            <Headphones size={18} />
            Need Help?
          </Button>
        </HelpDialog>
      </div>
    </div>
  );
}
