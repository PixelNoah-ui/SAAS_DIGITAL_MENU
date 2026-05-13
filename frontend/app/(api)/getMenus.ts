import { ProductType } from "@/types/Types";

export interface GetMenusFilters {
  collections?: string | string[];
  price_min?: number;
  price_max?: number;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ✅ Backend menu item shape
interface MenuItemFromAPI {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  category?: string;
  preparationTime?: number;
}

// ✅ Full API response type
interface ApiResponse {
  status: string;
  totalPages: number;
  data: {
    menuItems: MenuItemFromAPI[];
  };
}

// ✅ Final return type
export interface GetMenusResponse {
  menuItems: ProductType[];
  totalPages: number;
}

export default async function getMenus(
  filters: GetMenusFilters = {},
): Promise<GetMenusResponse> {
  const params = new URLSearchParams();

  // Collections filter
  if (filters.collections) {
    if (Array.isArray(filters.collections)) {
      filters.collections.forEach((collection) =>
        params.append("collections", collection),
      );
    } else {
      params.append("collections", filters.collections);
    }
  }

  // Price range filter
  if (filters.price_min !== undefined) {
    params.append("price_min", String(filters.price_min));
  }
  if (filters.price_max !== undefined) {
    params.append("price_max", String(filters.price_max));
  }

  // Sort filter
  if (filters.sort) {
    params.append("sort", filters.sort);
  }

  // Search filter
  if (filters.search) {
    params.append("search", filters.search);
  }

  // Pagination
  if (filters.page) {
    params.append("page", String(filters.page));
  }
  if (filters.limit) {
    params.append("limit", String(filters.limit));
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // ✅ optional for fresh data
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch menus:", errorData);
      return { menuItems: [], totalPages: 0 };
    }

    const result: ApiResponse = await response.json();
    console.log("Fetched menus:", result);

    return {
      menuItems: result.data.menuItems.map((item) => ({
        id: item.id,
        title: item.name,
        description: item.description || "",
        price: Number(item.price),
        image: item.imageUrl || "/images/bg.png",
        imageUrl: item.imageUrl,
        time: `${item.preparationTime || 15}-${(item.preparationTime || 15) + 5} min`,
        category: item.category || "other",
      })),
      totalPages: result.totalPages || 0,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return { menuItems: [], totalPages: 0 };
  }
}
