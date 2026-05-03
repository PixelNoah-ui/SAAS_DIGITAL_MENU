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
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface GetOrdersBySessionResponse {
  status: string;
  data: {
    orders: Order[];
  };
}

export async function getOrdersBySession(
  sessionToken: string,
): Promise<GetOrdersBySessionResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders/session?sessionToken=${sessionToken}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch orders");
  }

  const result = await res.json();
  console.log("Fetched orders for session:", result);
  return result as Promise<GetOrdersBySessionResponse>;
}
