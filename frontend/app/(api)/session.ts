export interface Session {
  id: string;
  tableId: string;
  expiresAt: string;
}

export interface SessionResponse {
  status: string;
  data: {
    session: Session;
  };
}

export interface CurrentSessionResponse {
  status: string;
  data: {
    session: Session & {
      table: {
        id: string;
        tableNumber: number;
        qrToken: string;
      };
    };
  };
}

export async function createSession(tableId: string): Promise<SessionResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important: send cookies
    body: JSON.stringify({ tableId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create session");
  }

  return res.json() as Promise<SessionResponse>;
}

export async function getCurrentSession(): Promise<CurrentSessionResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: send cookies
    },
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to get session");
  }

  return res.json() as Promise<CurrentSessionResponse>;
}

export async function closeSession(): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to close session");
  }
}
