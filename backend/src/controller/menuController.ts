import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";
import { Prisma } from "../generated/prisma/client.js";

const parseBooleanQuery = (value: string | string[] | undefined) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) value = value[0];
  return value === "true" || value === "1";
};

export const getMenuItems = catchAsync(async (req, res) => {
  const categoryId =
    typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
  const isAvailable = parseBooleanQuery(
    req.query.isAvailable as string | undefined,
  );
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (isAvailable !== undefined) where.isAvailable = isAvailable;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const menuItems = await prisma.menuItem.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  res.status(200).json({
    status: "success",
    results: menuItems.length,
    data: { menuItems },
  });
});

export const getMenuItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: id as string },
    include: { category: true },
  });

  if (!menuItem) {
    return next(new AppError("Menu item not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { menuItem },
  });
});

export const createMenuItem = catchAsync(async (req, res, next) => {
  const data = req.body;

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const menuItem = await prisma.menuItem.create({
    data,
    include: { category: true },
  });

  res.status(201).json({
    status: "success",
    data: { menuItem },
  });
});

export const updateMenuItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (updateData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: updateData.categoryId },
    });
    if (!category) {
      return next(new AppError("Category not found", 404));
    }
  }

  const existingMenuItem = await prisma.menuItem.findUnique({
    where: { id: id as string },
  });
  if (!existingMenuItem) {
    return next(new AppError("Menu item not found", 404));
  }

  const menuItem = await prisma.menuItem.update({
    where: { id: id as string },
    data: updateData,
    include: { category: true },
  });

  res.status(200).json({
    status: "success",
    data: { menuItem },
  });
});

export const deleteMenuItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const existingMenuItem = await prisma.menuItem.findUnique({
    where: { id: id as string },
  });
  if (!existingMenuItem) {
    return next(new AppError("Menu item not found", 404));
  }

  await prisma.menuItem.delete({ where: { id: id as string } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
