import { MenuGrid } from "@/components/MenuGrid";

export default function Loading() {
  return (
    <div className="group flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start">
      <aside className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64">
        {/* Collections filter skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
        {/* Price filter skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </aside>
      <div className="w-full max-w-7xl space-y-5">
        {/* Sort filter skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <MenuGrid
          menuItems={[]}
          totalPages={1}
          currentPage={1}
          isLoading={true}
        />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
