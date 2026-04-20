"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ActiveOrderSkeleton() {
  return (
    <div className="border-t border-muted-foreground px-3 py-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="text-right">
          <Skeleton className="h-6 w-16 ml-auto mb-2" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mt-8">
        {/* Step 1 */}
        <div className="flex flex-col items-center text-center">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-12 mt-2" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-14 mt-2" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-16 mt-2" />
        </div>

        {/* Step 4 */}
        <div className="flex flex-col items-center text-center">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-16 mt-2" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-6" />

      {/* Order Details */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Help Button */}
      <div className="mt-6">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
