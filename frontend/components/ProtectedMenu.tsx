"use client";

import { useTableStore } from "@/store/tableStore";
import SearchFilterLayout from "@/app/SearchFilter";
import { MenuGrid } from "@/components/MenuGrid";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types/Types";
import InvalidPage from "@/app/InvalidPage/page";

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
    return <InvalidPage isInvalidQR={false} />;
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
