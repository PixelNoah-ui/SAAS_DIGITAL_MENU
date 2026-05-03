import multer from "multer";
import type { Request, Response, NextFunction } from "express";
export declare const upload: multer.Multer;
export declare const uploadBufferToCloudinary: (buffer: Buffer, folder?: string) => Promise<any>;
export declare const processProductImage: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=uploadImages.d.ts.map