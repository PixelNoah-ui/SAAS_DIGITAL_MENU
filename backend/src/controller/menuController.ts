import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";

export const getMenuItems = catchAsync(async (req, res) => {
  const search = req.query.search as string | undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

  // Filter params
  const collections = req.query.collections;
  const priceMin = req.query.price_min
    ? Number(req.query.price_min)
    : undefined;
  const priceMax = req.query.price_max
    ? Number(req.query.price_max)
    : undefined;
  const sort = (req.query.sort as string) || "last_updated";

  const where: any = {};

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Collection/Category filter
  if (collections) {
    const categoryList = Array.isArray(collections)
      ? collections
      : [collections];
    where.category = { in: categoryList };
  }

  // Price range filter
  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {};
    if (priceMin !== undefined) {
      where.price.gte = priceMin;
    }
    if (priceMax !== undefined) {
      where.price.lte = priceMax;
    }
  }

  // Only show available items
  where.isAvailable = true;

  // Sorting
  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "name_desc":
      orderBy = { name: "desc" };
      break;
    case "last_updated":
    default:
      orderBy = { updatedAt: "desc" };
      break;
  }

  const total = await prisma.menuItem.count({ where });

  const menuItems = await prisma.menuItem.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  res.status(200).json({
    status: "success",
    results: menuItems.length,
    totalPages: Math.ceil(total / limit),
    data: { menuItems },
  });
});

export const getMenuItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: id as string },
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

  const menuItem = await prisma.menuItem.create({
    data,
  });

  res.status(201).json({
    status: "success",
    data: { menuItem },
  });
});

export const updateMenuItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingMenuItem = await prisma.menuItem.findUnique({
    where: { id: id as string },
  });
  if (!existingMenuItem) {
    return next(new AppError("Menu item not found", 404));
  }

  const menuItem = await prisma.menuItem.update({
    where: { id: id as string },
    data: updateData,
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
