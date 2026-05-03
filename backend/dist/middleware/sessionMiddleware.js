import { prisma } from "../lib/Prisma.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
const SESSION_COOKIE_NAME = "session_token";
export function getSessionCookieName() {
    return SESSION_COOKIE_NAME;
}
export function setSessionCookie(res, sessionToken, expiresAt) {
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: maxAge > 0 ? maxAge : 0,
        path: "/",
    });
}
export function clearSessionCookie(res) {
    res.cookie(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
}
export const getSessionFromCookie = catchAsync(async (req, res, next) => {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
    if (!sessionToken) {
        return next(new AppError("No session found. Please scan QR code again.", 401));
    }
    const session = await prisma.orderSession.findUnique({
        where: { sessionToken },
        include: {
            table: true,
        },
    });
    if (!session) {
        clearSessionCookie(res);
        return next(new AppError("Session not found. Please scan QR code again.", 401));
    }
    if (session.status !== "ACTIVE") {
        clearSessionCookie(res);
        return next(new AppError("Session expired. Please scan QR code again.", 401));
    }
    if (new Date(session.expiresAt) < new Date()) {
        await prisma.orderSession.update({
            where: { id: session.id },
            data: { status: "EXPIRED" },
        });
        clearSessionCookie(res);
        return next(new AppError("Session expired. Please scan QR code again.", 401));
    }
    req.session = {
        id: session.id,
        tableId: session.tableId,
        sessionToken: session.sessionToken,
        status: session.status,
        expiresAt: session.expiresAt,
    };
    next();
});
export const requireSession = catchAsync(async (req, res, next) => {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
    if (!sessionToken) {
        return next(new AppError("No active session. Please scan the table QR code.", 401));
    }
    const session = await prisma.orderSession.findUnique({
        where: { sessionToken },
    });
    if (!session || session.status !== "ACTIVE") {
        clearSessionCookie(res);
        return next(new AppError("Session expired or invalid. Please scan QR code again.", 401));
    }
    if (new Date(session.expiresAt) < new Date()) {
        await prisma.orderSession.update({
            where: { id: session.id },
            data: { status: "EXPIRED" },
        });
        clearSessionCookie(res);
        return next(new AppError("Session expired. Please scan QR code again.", 401));
    }
    req.session = {
        id: session.id,
        tableId: session.tableId,
        sessionToken: session.sessionToken,
        status: session.status,
        expiresAt: session.expiresAt,
    };
    next();
});
//# sourceMappingURL=sessionMiddleware.js.map