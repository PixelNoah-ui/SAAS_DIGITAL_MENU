"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MenuCardSkeleton() {
  return (
    <Card className="overflow-hidden border bg-card rounded-lg shadow-sm">
      <div className="flex gap-4 p-4">
        {/* Image Skeleton */}
        <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-md">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-2">
          {/* Title and Description */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          {/* Price, Time, and Button */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="w-9 h-9 md:w-10 md:h-10 rounded-lg" />
          </div>
        </div>
      </div>
    </Card>
  );
}
