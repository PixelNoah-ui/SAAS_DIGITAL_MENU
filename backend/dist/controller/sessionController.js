import { randomBytes } from "crypto";
import { prisma } from "../lib/Prisma.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { setSessionCookie, clearSessionCookie, } from "../middleware/sessionMiddleware.js";
import dotenv from "dotenv";
const SESSION_EXPIRE_HOURS = Number(process.env.SESSION_EXPIRE_HOURS ?? 3);
const SESSION_EXPIRE_MS = SESSION_EXPIRE_HOURS * 60 * 60 * 1000;
/**
 * CREATE OR REUSE SESSION
 */
export const createOrReuseSession = catchAsync(async (req, res) => {
    const { tableId } = req.body;
    if (!tableId || typeof tableId !== "string") {
        throw new AppError("Valid tableId is required", 400);
    }
    // 1. Validate table
    const table = await prisma.table.findUnique({
        where: { id: tableId },
    });
    if (!table || !table.isActive) {
        throw new AppError("Table not found or inactive", 404);
    }
    // 2. Check active session
    const existingSession = await prisma.orderSession.findFirst({
        where: {
            tableId,
            status: "ACTIVE",
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });
    const expiresAt = new Date(Date.now() + SESSION_EXPIRE_MS);
    // 3. REUSE SESSION
    if (existingSession) {
        const updatedSession = await prisma.orderSession.update({
            where: { id: existingSession.id },
            data: { expiresAt },
        });
        setSessionCookie(res, updatedSession.sessionToken, expiresAt);
        return res.status(200).json({
            status: "success",
            data: {
                session: {
                    id: updatedSession.id,
                    tableId: updatedSession.tableId,
                    sessionToken: updatedSession.sessionToken, // ✅ FIXED
                    expiresAt: updatedSession.expiresAt.toISOString(),
                },
            },
        });
    }
    // 4. CREATE NEW SESSION
    const sessionToken = randomBytes(32).toString("hex");
    const newSession = await prisma.orderSession.create({
        data: {
            tableId,
            sessionToken,
            status: "ACTIVE",
            expiresAt,
        },
    });
    setSessionCookie(res, sessionToken, expiresAt);
    return res.status(201).json({
        status: "success",
        data: {
            session: {
                id: newSession.id,
                tableId: newSession.tableId,
                sessionToken, // ✅ FIXED
                expiresAt: newSession.expiresAt.toISOString(),
            },
        },
    });
});
export const getCurrentSession = catchAsync(async (req, res) => {
    if (!req.session) {
        throw new AppError("No active session", 401);
    }
    const session = await prisma.orderSession.findUnique({
        where: { id: req.session.id },
        include: {
            table: {
                select: {
                    id: true,
                    tableNumber: true,
                    qrToken: true,
                },
            },
        },
    });
    if (!session || session.status !== "ACTIVE") {
        throw new AppError("Session not found or expired", 404);
    }
    return res.status(200).json({
        status: "success",
        data: {
            session: {
                id: session.id,
                tableId: session.tableId,
                sessionToken: session.sessionToken, // ✅ FIXED
                table: session.table,
                expiresAt: session.expiresAt.toISOString(),
            },
        },
    });
});
export const closeSession = catchAsync(async (req, res) => {
    if (!req.session) {
        throw new AppError("No active session", 401);
    }
    await prisma.orderSession.update({
        where: { id: req.session.id },
        data: { status: "CLOSED" },
    });
    clearSessionCookie(res);
    return res.status(200).json({
        status: "success",
        data: {},
    });
});
//# sourceMappingURL=sessionController.js.map