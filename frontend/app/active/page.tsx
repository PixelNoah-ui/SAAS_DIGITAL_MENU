"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OrderSearchFilterLayout from "./OrderSearchFilter";
import { OrderGrid } from "@/components/OrderGrid";
import { useAllOrders } from "@/hooks/useAllOrders";
import { useTableStore } from "@/store/tableStore";
import InvalidPage from "@/app/InvalidPage/page";
import { Button } from "@/components/ui/button";

function OrdersContent() {
  const searchParams = useSearchParams();
  const table = useTableStore((state) => state.table);

  const filters = {
    page: Number(searchParams.get("page")) || 1,
    status: searchParams.getAll("status"),
    date_from: searchParams.get("date_from") || undefined,
    date_to: searchParams.get("date_to") || undefined,
    sort: searchParams.get("sort") || "newest",
  };

  const { data, isLoading, error } = useAllOrders(filters);

  if (!table) {
    return <InvalidPage isInvalidQR={false} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="rounded-full bg-card p-4 border border-border shadow-sm">
          <svg
            className="h-10 w-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">
          No Active Orders Yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          You haven&apos;t placed any orders yet. Head to the menu to get
          started!
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button className="rounded-none px-6 py-2 text-sm">
              Browse Menu
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const orders = data?.data.orders || [];
  const totalPages = data?.data.pagination.totalPages || 1;
  const currentPage = data?.data.pagination.currentPage || 1;

  return (
    <OrderSearchFilterLayout>
      <div className="space-y-6">
        <OrderGrid
          orders={orders}
          totalPages={totalPages}
          currentPage={currentPage}
          isLoading={isLoading}
        />
      </div>
    </OrderSearchFilterLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
