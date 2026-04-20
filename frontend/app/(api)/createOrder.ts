import { CartItem } from "@/types/cart";

export interface OrderItem {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  tableId: string;
  items: OrderItem[];
  sessionToken?: string;
}

export interface OrderResponse {
  status: string;
  data: {
    order: {
      id: string;
      totalAmount: number;
      status: string;
      items: Array<{
        id: string;
        menuItemId: string;
        quantity: number;
        price: number;
      }>;
    };
  };
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create order");
  }

  const result = await res.json();
  return result as Promise<OrderResponse>;
}
