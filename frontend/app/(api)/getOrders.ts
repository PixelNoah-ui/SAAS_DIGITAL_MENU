export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: string;
  menuItem?: {
    name: string;
  };
}

export interface Order {
  id: string;
  totalAmount: string;
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED";
  createdAt: string;
  items: OrderItem[];
}

export interface GetAllOrdersResponse {
  status: string;
  data: {
    orders: Order[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export const getAllOrders = async (filters: {
  page?: number;
  status?: string[];
  date_from?: string;
  date_to?: string;
  sort?: string;
}): Promise<GetAllOrdersResponse> => {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", filters.page.toString());
  if (filters.status && filters.status.length > 0) {
    filters.status.forEach((status) => {
      if (status) params.append("status", status);
    });
  }
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.sort) params.set("sort", filters.sort);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/session${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Failed to fetch orders:", err);
    throw new Error("Failed to fetch orders");
  }

  return res.json();
};
