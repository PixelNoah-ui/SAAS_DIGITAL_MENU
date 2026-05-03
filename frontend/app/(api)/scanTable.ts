export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: string;
}

export interface ScanTableResponse {
  success: boolean;
  data: {
    table: Table;
  };
}
export const scanTableApi = async (
  qrToken: string,
): Promise<ScanTableResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tables/scan`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ qrToken }),
    },
  );

  if (!res.ok) {
    throw new Error("Invalid QR");
  }

  return res.json();
};
