import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

import { AppError } from "../utils/AppError.js";
import { prisma } from "../lib/Prisma.js";
import sendEmail from "../utils/sendEmail.js";
import type { Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { resetPasswordTemplate } from "../utils/resetPassword.js";

dotenv.config();

/* ================= TYPES ================= */
interface DecodedToken extends JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

/* ================= CONFIG ================= */
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = "7d";

if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

/* ================= HELPER ================= */
const signToken = (id: string) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const createSendToken = (
  user: any,
  statusCode: number,
  res: Response,
  message: string,
) => {
  const token = signToken(user.id);

  delete user.password;
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.status(statusCode).json({
    status: "success",
    message,
    token,
  });
};

/* ================= SIGNUP ================= */
export const signup = catchAsync(async (req, res, next) => {
  console.log("Signup request body:", req.body);
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    return next(new AppError("All fields required", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return next(new AppError("Email already exists", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.create({
    data: {
      name: fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "STAFF",
    },
  });

  res.status(201).json({
    status: "success",
    message: "User created successfully",
  });
});

/* ================= LOGIN ================= */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email & password required", 400));
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingTime = Math.ceil(
      (user.lockUntil.getTime() - Date.now()) / 1000 / 60,
    );

    return next(
      new AppError(
        `Account locked. Try again in ${remainingTime} minutes.`,
        403,
      ),
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const attempts = user.failedLoginAttempts + 1;

    const updateData: any = {
      failedLoginAttempts: attempts,
    };

    if (attempts >= 5) {
      updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: updateData,
    });

    return next(new AppError("Invalid credentials", 401));
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null,
    },
  });

  createSendToken(user, 200, res, "Logged in successfully");
});

/* ================= LOGOUT ================= */
export const logout = catchAsync(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out",
  });
});

/* ================= PROTECT ================= */
export const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("Not authenticated", 401));
  }

  let decoded: DecodedToken;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  if (user.passwordChangedAt) {
    const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);

    if (decoded.iat < changedAt) {
      return next(new AppError("Password recently changed", 401));
    }
  }

  req.user = user;
  next();
});

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const resetURL = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`;

  await sendEmail({
    email: user.email,
    subject: "Reset your Digital Menu password",
    html: resetPasswordTemplate(resetURL),
  });

  res.status(200).json({
    status: "success",
    message: "Reset link sent to email",
  });
});

/* ================= RESET PASSWORD ================= */
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) {
    return next(new AppError("All fields required", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  if (!token) {
    return next(new AppError("Token missing", 400));
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token as string)
    .digest("hex");

  const user = await prisma.adminUser.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      passwordChangedAt: new Date(),
    },
  });

  res.status(200).json({
    status: "success",
    message: "Password reset successful",
  });
});

/* ================= UPDATE PASSWORD ================= */
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError("All fields required", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return next(new AppError("Current password incorrect", 401));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  createSendToken(user, 200, res, "Password updated successfully");
});

/* ================= GET ME ================= */
export const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});
