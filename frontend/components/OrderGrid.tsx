"use client";

import { Order } from "@/app/(api)/getOrders";
import PaginationBar from "@/components/PaginationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, CheckCircle2, ChefHat, Bike } from "lucide-react";

interface OrderGridProps {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  isLoading?: boolean;
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PREPARING":
      return "bg-blue-100 text-blue-800";
    case "READY":
      return "bg-green-100 text-green-800";
    case "DELIVERED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
    <div className="flex flex-col items-center text-center relative z-50">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          active ? "border-2 border-primary bg-primary/10" : "bg-muted"
        }`}
      >
        <Icon
          className={active ? "text-primary" : "text-muted-foreground"}
          size={18}
        />
      </div>
      <p className="text-xs mt-1">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function OrderGrid({
  orders,
  totalPages,
  currentPage,
  isLoading,
}: OrderGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-5 bg-muted rounded w-16"></div>
              </div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              {/* Steps skeleton */}
              <div className="flex items-center justify-between mb-4">
                {Array.from({ length: 4 }).map((_, stepIndex) => (
                  <div
                    key={stepIndex}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="h-3 bg-muted rounded w-8 mt-1"></div>
                    <div className="h-3 bg-muted rounded w-10 mt-1"></div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-10"></div>
                  <div className="h-4 bg-muted rounded w-14"></div>
                </div>
                <div className="pt-2">
                  <div className="h-4 bg-muted rounded w-12 mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="rounded-full bg-card p-4 border border-border shadow-sm">
          <Package className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">No Orders Yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Start placing orders from the menu to see your active orders here.
        </p>
      </div>
    );
  }

  return (
    <div className="group-has-data-pending:animate-pulse space-y-6">
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="hover:shadow-md rounded-none transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  Order #{order.id.slice(-6).toUpperCase()}
                </CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* STEPS */}
              <div className="relative mb-8 z-0">
                <div className="relative z-10 flex items-center justify-between mb-4">
                  <Step
                    icon={CheckCircle2}
                    active={getStatusStep(order.status) >= 0}
                    label="Order"
                    sub="Received"
                  />
                  <Step
                    icon={ChefHat}
                    active={getStatusStep(order.status) >= 1}
                    label="Kitchen"
                    sub="Preparing"
                  />
                  <Step
                    icon={Bike}
                    active={getStatusStep(order.status) >= 2}
                    label="On the Way"
                  />
                  <Step
                    icon={Package}
                    active={getStatusStep(order.status) >= 3}
                    label="Delivered"
                  />
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    {Number(order.totalAmount).toFixed(2)} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-sm text-muted-foreground mb-2">
                    Items:
                  </div>
                  <div className="space-y-1 max-h-16 overflow-y-auto">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="text-sm">
                        <span className="font-medium">{item.quantity}x</span>{" "}
                        {item.menuItem?.name || `Item #${item.menuItemId}`}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-sm text-muted-foreground">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationBar currentPage={currentPage} totalPage={totalPages} />
      )}
    </div>
  );
}
