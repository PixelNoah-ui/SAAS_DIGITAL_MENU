export interface TableResponse {
  status: string;
  data: {
    table: {
      id: string;
      name: string;
      qrToken: string;
      isActive: boolean;
    };
  };
}

export async function getTableByQrToken(
  qrToken: string,
): Promise<TableResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders/table/${qrToken}`,
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to get table");
  }

  const result = await res.json();
  return result as Promise<TableResponse>;
}
