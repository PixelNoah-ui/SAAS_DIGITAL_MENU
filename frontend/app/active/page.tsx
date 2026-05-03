"use client";

import { CheckCircle2, ChefHat, Package, Headphones, Bike } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HelpDialog } from "@/components/HelpDialog";
import { useActiveOrders } from "@/hooks/useActiveOrders";
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
  price: string;
  menuItem?: {
    name: string;
  };
}

interface Order {
  id: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function Page() {
  // ✅ CLEAN HOOK
  const { data, isLoading, error } = useActiveOrders();

  // ⏳ LOADING
  if (isLoading) {
    return <ActiveOrderSkeleton />;
  }

  // ❌ ERROR / EMPTY
  if (error || !data?.data?.orders?.length) {
    return <EmptyOrder />;
  }

  // ✅ ACTIVE ORDER
  const activeOrder: Order = data.data.orders[0];

  const currentStep = getStatusStep(activeOrder.status);

  const totalItems = activeOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div className="border-t border-muted-foreground px-3 py-5">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">
            Order {activeOrder.id.slice(-6).toUpperCase()}
          </h2>

          <p className="text-sm text-muted-foreground">
            Placed at {formatTime(activeOrder.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold">
            {Number(activeOrder.totalAmount).toFixed(2)} ETB
          </p>
          <p className="text-sm text-muted-foreground">{totalItems} items</p>
        </div>
      </div>

      {/* STEPS */}
      <div className="flex items-center justify-between mt-8">
        <Step
          icon={CheckCircle2}
          active={currentStep >= 0}
          label="Order"
          sub="Received"
        />
        <Step
          icon={ChefHat}
          active={currentStep >= 1}
          label="Kitchen"
          sub="Preparing"
        />
        <Step icon={Bike} active={currentStep >= 2} label="On the Way" />
        <Step icon={Package} active={currentStep >= 3} label="Delivered" />
      </div>

      <div className="border-t my-6" />

      {/* ITEMS */}
      <div>
        <h3 className="text-sm font-semibold mb-2">ORDER DETAILS</h3>

        {activeOrder.items.map((item) => (
          <p key={item.id} className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {item.quantity}x
            </span>{" "}
            {item.menuItem?.name || `Item #${item.menuItemId}`}
          </p>
        ))}
      </div>

      {/* HELP */}
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

// STEP COMPONENT (UNCHANGED)
function Step({
  icon: Icon,
  active,
  label,
  sub,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  active: boolean;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-full ${
          active ? "border-2 border-primary bg-primary/10" : "bg-muted"
        }`}
      >
        <Icon
          className={active ? "text-primary" : "text-muted-foreground"}
          size={20}
        />
      </div>
      <p className="text-sm mt-2">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
