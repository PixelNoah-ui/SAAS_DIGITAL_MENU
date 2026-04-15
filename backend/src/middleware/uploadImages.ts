import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import cloudinary from "../lib/cloudinary.js";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new AppError("Only image files are allowed", 400) as any,
        false,
      );
    }
    cb(null, true);
  },
});

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder = "products",
) => {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};
export const processProductImage = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) return next();

    const file = req.file as Express.Multer.File;

    const processedBuffer = await sharp(file.buffer)
      .resize(1000, 1000, {
        fit: "cover",
        position: "center",
      })
      .sharpen()
      .toFormat("webp")
      .webp({ quality: 90 })
      .toBuffer();

    const result = await uploadBufferToCloudinary(processedBuffer, "products");

    req.body.imageUrl = result.secure_url;
    req.body.imagePublicId = result.public_id;

    next();
  } catch (err) {
    console.error("PRODUCT IMAGE ERROR:", err);
    next(new AppError("Failed to process product image", 500));
  }
};
