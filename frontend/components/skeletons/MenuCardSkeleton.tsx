"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MenuCardSkeleton() {
  return (
    <Card className="overflow-hidden  border bg-card rounded-none  shadow-sm">
      <div className="relative w-full h-52">
        <Skeleton className="w-full h-full" />
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-16" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
