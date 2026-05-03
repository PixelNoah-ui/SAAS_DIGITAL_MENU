export function getSession() {
  const stored = sessionStorage.getItem("session");

  if (!stored) return null;

  const session = JSON.parse(stored);

  if (new Date(session.expiresAt) < new Date()) {
    sessionStorage.removeItem("session");
    return null;
  }

  return session;
}
