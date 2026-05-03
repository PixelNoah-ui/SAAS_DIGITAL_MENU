export interface SessionResponse {
  status: string;
  data: {
    session: {
      id: string;
      tableId: string;
      sessionToken: string;
      expiresAt: string;
    };
  };
}

export async function createSession(tableId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tableId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create session");
  }
  const result = await res.json();
  return result as Promise<SessionResponse>;
}
