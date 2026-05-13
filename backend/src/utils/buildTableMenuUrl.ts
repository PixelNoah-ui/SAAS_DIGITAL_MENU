import dotenv from "dotenv";
dotenv.config();
export const buildTableMenuUrl = (qrToken: string): string => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${baseUrl}/${qrToken}`; // IMPORTANT: /:qrToken
};
