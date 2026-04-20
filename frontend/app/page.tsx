import { MenuGrid } from "@/components/MenuGrid";
import SearchFilterLayout from "./SearchFilter";
import getMenus from "@/app/(api)/getMenus";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const collection = [
    { name: "Breakfast", slug: "breakfast" },
    { name: "Lunch", slug: "lunch" },
    { name: "Dinner", slug: "dinner" },
    { name: "Drinks", slug: "drinks" },
  ];

  // Build filters from URL params
  const filters = {
    collections: params.collection,
    price_min: params.price_min ? Number(params.price_min) : undefined,
    price_max: params.price_max ? Number(params.price_max) : undefined,
    sort: params.sort as string | undefined,
    search: params.search as string | undefined,
    page: params.page ? Number(params.page) : 1,
  };

  const { menuItems, totalPages } = await getMenus(filters);

  const currentPage = filters.page || 1;

  return (
    <div>
      <SearchFilterLayout collections={collection}>
        <MenuGrid
          menuItems={menuItems}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </SearchFilterLayout>
    </div>
  );
}
