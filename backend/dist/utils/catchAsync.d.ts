import type { Request, Response, NextFunction, RequestHandler } from "express";
export declare const catchAsync: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => RequestHandler;
//# sourceMappingURL=catchAsync.d.ts.map