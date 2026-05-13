import { ProductType } from "@/types/Types";

export interface GetMenuBySlugResponse {
  menuItem: ProductType;
}

export default async function getMenu(
  id: string,
): Promise<GetMenuBySlugResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch menu item:", errorData);
      return null;
    }

    const result = await response.json();

    return {
      menuItem: {
        id: result.data.menuItem.id,
        title: result.data.menuItem.name,
        description: result.data.menuItem.description || "",
        price: Number(result.data.menuItem.price),
        image: result.data.menuItem.imageUrl || "/images/bg.png",
        imageUrl: result.data.menuItem.imageUrl,
        time: `${result.data.menuItem.preparationTime || 15}-${
          (result.data.menuItem.preparationTime || 15) + 5
        } min`,
        category: result.data.menuItem.categoryType || "other",
      },
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}
