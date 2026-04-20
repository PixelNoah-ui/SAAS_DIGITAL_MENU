"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UtensilsCrossed, ShoppingBag, Clock } from "lucide-react";

const navItems = [
  {
    label: "Menu",
    href: "/",
    icon: UtensilsCrossed,
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingBag,
  },
  {
    label: "Active",
    href: "/active",
    icon: Clock,
  },
];

export default function BottomFooter() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1 text-xs transition",
                isActive ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
