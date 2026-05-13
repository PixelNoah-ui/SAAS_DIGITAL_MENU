import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRouter from "./router/authRouter.js";
import sessionRouter from "./router/sessionRouter.js";
import orderRouter from "./router/orderRouter.js";
import menuRouter from "./router/menuRouter.js";
import managerRouter from "./router/managerRouter.js";
import restaurantRouter from "./router/restaurantRouter.js";
import dashboardRouter from "./router/dashboardRouter.js";
import tableRouter from "./router/tableRouter.js";
import { globalErrorHandler } from "./controller/ErrorController.js";
const app = express();
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", limiter);
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://10.210.16.82:3000",
        "http://10.46.36.82:3000",
    ],
    credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/orders", orderRouter);
app.use("/api/menu-items", menuRouter);
app.use("/api/managers", managerRouter);
app.use("/api/restaurant-info", restaurantRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/tables", tableRouter);
const publicDir = path.join(process.cwd(), "src", "public");
app.use(express.static(publicDir));
app.all("/{*any}", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server`,
    });
});
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=index.js.map