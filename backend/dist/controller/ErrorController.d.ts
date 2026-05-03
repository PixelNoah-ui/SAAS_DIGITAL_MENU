import type { Request, Response, NextFunction } from "express";
export interface AppError extends Error {
    statusCode?: number;
    status?: "fail" | "error";
    isOperational?: boolean;
    code?: string;
    type?: string;
}
export declare const globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=ErrorController.d.ts.map