import dotenv from "dotenv";
import app from "./index.js";
import { prisma } from "./lib/Prisma.js";
import morgan from "morgan";
dotenv.config();

const PORT = process.env.PORT || 8000;
app.use(morgan("dev"));
await prisma.$connect();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION 💥", err);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("👋 SIGTERM received. Shutting down...");
  server.close(async () => {
    await prisma.$disconnect();
  });
});
