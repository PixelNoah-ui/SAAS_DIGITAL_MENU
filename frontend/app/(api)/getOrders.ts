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

export interface GetActiveOrdersResponse {
  status: string;
  data: {
    orders: Order[];
  };
}
export const getActiveOrders = async (): Promise<GetActiveOrdersResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders/session`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("Failed to fetch active orders:", err);
    throw new Error("Failed to fetch orders");
  }

  return res.json();
};
