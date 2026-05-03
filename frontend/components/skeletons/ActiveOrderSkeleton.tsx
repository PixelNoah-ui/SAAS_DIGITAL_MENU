"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ActiveOrderSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>

        <div className="text-right space-y-2">
          <Skeleton className="h-5 w-24 ml-auto" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>

      {/* STEPS */}
      <div className="flex items-center justify-between mt-8">
        <StepSkeleton />
        <StepSkeleton />
        <StepSkeleton />
        <StepSkeleton />
      </div>

      {/* DIVIDER */}
      <Skeleton className="h-px w-full" />

      {/* ORDER DETAILS TITLE */}
      <Skeleton className="h-4 w-40" />

      {/* ITEMS */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* HELP BUTTON */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

/* STEP SKELETON */
function StepSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-2 w-12" />
    </div>
  );
}
