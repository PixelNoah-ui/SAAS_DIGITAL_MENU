import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";
import bcrypt from "bcryptjs";
import { UserRole } from "../generated/prisma/enums.js";

export const getManagers = catchAsync(async (req, res) => {
  const managers = await prisma.adminUser.findMany({
    where: { role: UserRole.MANAGER },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    status: "success",
    results: managers.length,
    data: { managers },
  });
});

export const getManager = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const manager = await prisma.adminUser.findFirst({
    where: { id: id as string, role: UserRole.MANAGER },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!manager) {
    return next(new AppError("Manager not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { manager },
  });
});

export const createManager = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
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

  const manager = await prisma.adminUser.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.MANAGER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    status: "success",
    data: { manager },
  });
});

export const updateManager = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, password, confirmPassword } = req.body;

  const manager = await prisma.adminUser.findFirst({
    where: { id: id as string, role: UserRole.MANAGER },
  });

  if (!manager) {
    return next(new AppError("Manager not found", 404));
  }

  const updateData: any = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email.toLowerCase();
  if (password || confirmPassword) {
    if (!password || !confirmPassword) {
      return next(new AppError("Both password fields are required", 400));
    }
    if (password !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }
    updateData.password = await bcrypt.hash(password, 12);
  }

  const updatedManager = await prisma.adminUser.update({
    where: { id: id as string },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: { manager: updatedManager },
  });
});

export const deleteManager = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const manager = await prisma.adminUser.findFirst({
    where: { id: id as string, role: UserRole.MANAGER },
  });

  if (!manager) {
    return next(new AppError("Manager not found", 404));
  }

  await prisma.adminUser.delete({ where: { id: id as string } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
