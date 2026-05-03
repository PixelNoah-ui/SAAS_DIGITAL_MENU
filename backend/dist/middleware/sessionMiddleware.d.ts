import type { Response } from "express";
declare global {
    namespace Express {
        interface Request {
            session?: {
                id: string;
                tableId: string;
                sessionToken: string;
                status: string;
                expiresAt: Date;
            };
        }
    }
}
export declare function getSessionCookieName(): string;
export declare function setSessionCookie(res: Response, sessionToken: string, expiresAt: Date): void;
export declare function clearSessionCookie(res: Response): void;
export declare const getSessionFromCookie: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const requireSession: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=sessionMiddleware.d.ts.map