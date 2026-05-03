"use client";

import { useTableStore } from "@/store/tableStore";
import SearchFilterLayout from "@/app/SearchFilter";
import { MenuGrid } from "@/components/MenuGrid";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types/Types";

interface Collection {
  name: string;
  slug: string;
}

interface ProtectedMenuProps {
  menuItems: ProductType[];
  totalPages: number;
  currentPage: number;
  collections: Collection[];
}

export default function ProtectedMenu({
  menuItems,
  totalPages,
  currentPage,
  collections,
}: ProtectedMenuProps) {
  const table = useTableStore((state) => state.table);

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
          {/* ICON */}
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl">📱</span>
          </div>

          {/* TITLE */}
          <h1 className="text-xl font-semibold">Scan QR to Continue</h1>

          {/* DESCRIPTION */}
          <p className="text-sm text-muted-foreground max-w-sm">
            Please scan the QR code on your table to access the menu and start
            ordering.
          </p>

          {/* SIMPLE STEPS */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>📷 Open camera</p>
            <p>🔳 Scan table QR</p>
            <p>🍽 Start ordering</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SearchFilterLayout collections={collections}>
      <MenuGrid
        menuItems={menuItems}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </SearchFilterLayout>
  );
}
