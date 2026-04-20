"use client";

import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmptyOrder() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-8 text-center bg-background">
      {/* Icon */}
      <div className="rounded-full bg-card p-4 border border-border shadow-sm">
        <Clock className="h-10 w-10 text-primary" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        No Active Orders
      </h2>

      {/* Description */}
      <p className="max-w-xs text-sm text-muted-foreground">
        You don&apos;t have any orders currently being prepared.
      </p>

      {/* Actions */}
      <Button asChild className="rounded-none px-6 py-2 text-sm">
        <Link href="/">
          View Menu
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
