"use client";

import MenuCard from "@/components/menu/MenuCard";
import { MenuCardSkeleton } from "@/components/skeletons/MenuCardSkeleton";
import PaginationBar from "@/components/PaginationBar";
import { ProductType } from "@/types/Types";

interface MenuGridProps {
  menuItems: ProductType[];
  totalPages: number;
  currentPage: number;
  isLoading?: boolean;
}

export function MenuGrid({
  menuItems,
  totalPages,
  currentPage,
  isLoading,
}: MenuGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (menuItems.length === 0) {
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">No Products Found</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          No products match your current filters. Try adjusting your search
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="group-has-data-pending:animate-pulse space-y-10">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {menuItems.map((item) => (
          <MenuCard key={item.id} menu={item} />
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationBar currentPage={currentPage} totalPage={totalPages} />
      )}
    </div>
  );
}
