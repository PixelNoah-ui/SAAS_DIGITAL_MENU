export interface RestaurantInfo {
  id: string;
  name: string;
  phone: string;
  address: string;
  room: string;
  logoUrl: string | null;
  telegramUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantInfoResponse {
  status: string;
  data: {
    restaurant: RestaurantInfo;
  };
}

export async function getRestaurantInfo(): Promise<RestaurantInfoResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurant`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch restaurant info");
  }

  const result = await res.json();
  return result as Promise<RestaurantInfoResponse>;
}
