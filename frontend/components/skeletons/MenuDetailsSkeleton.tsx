"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MenuDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-0 py-10 flex flex-col md:flex-row gap-10">
      {/* LEFT - Image */}
      <div className="basis-2/5 w-full md:sticky md:top-10">
        <Skeleton className="w-full h-80 rounded-xl" />
      </div>

      {/* RIGHT CONTENT */}
      <div className="basis-3/5 w-full space-y-5">
        {/* TITLE */}
        <div className="space-y-2.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* PRICE + TIME */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* QUANTITY */}
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-20" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-8 h-8" />
          </div>
        </div>

        {/* ADD TO CART */}
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
