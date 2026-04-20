"use client";

import { Dot, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useRestaurantInfo } from "@/hooks/useRestaurantInfo";
import { HelpDialog } from "../HelpDialog";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { data } = useRestaurantInfo();

  const restaurant = data?.data?.restaurant;
  const restaurantName = restaurant?.name || "My Restaurant";
  const restaurantRoom = restaurant?.room || "";
  const logoUrl = restaurant?.logoUrl || "/images/logo.svg";

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10">
            <Image
              src={logoUrl}
              alt={restaurantName}
              fill
              className="object-contain"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              {restaurantName}
            </h1>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              {restaurantRoom && (
                <span className="font-medium">Room {restaurantRoom}</span>
              )}

              <div className="flex items-center gap-1">
                <Dot size={16} className="text-green-500" />
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <HelpDialog>
            <button className="rounded-4xl px-6 py-2 bg-primary text-white cursor-pointer">
              Help
            </button>
          </HelpDialog>

          {/* 🛒 Cart with badge */}
          <Link href="/cart" className="relative cursor-pointer">
            <ShoppingBag size={22} className="text-gray-800" />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
