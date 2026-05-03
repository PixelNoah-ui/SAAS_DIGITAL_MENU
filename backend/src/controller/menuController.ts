import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";
import { Prisma } from "../generated/prisma/client.js";

/**
 * Helpers
 */
const getString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const getNumber = (value: unknown): number | undefined => {
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export const getMenuItems = catchAsync(async (req, res) => {
  const search = getString(req.query.search);
  const page = Math.max(1, getNumber(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, getNumber(req.query.limit) || 50));

  // Filters
  const collections = req.query.collections;
  const priceMin = getNumber(req.query.price_min);
  const priceMax = getNumber(req.query.price_max);
  const sort = getString(req.query.sort) || "last_updated";

  const where: any = {
    isAvailable: true,
  };

  /**
   * 🔍 Search
   */
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  /**
   * 📂 Category filter
   */
  if (collections) {
    const categoryList = (
      Array.isArray(collections) ? collections : [collections]
    ).filter((c): c is string => typeof c === "string" && c.trim() !== "");

    if (categoryList.length > 0) {
      // Use OR array for case-insensitive match
      where.OR = categoryList.map((cat) => ({
        category: { equals: cat.trim(), mode: "insensitive" },
      }));
    }
  }

  /**
   * 💰 Price filter (Decimal FIX)
   */
  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {};

    if (priceMin !== undefined) {
      where.price.gte = new Prisma.Decimal(priceMin);
    }

    if (priceMax !== undefined) {
      where.price.lte = new Prisma.Decimal(priceMax);
    }
  }

  /**
   * 🔄 Sorting
   */
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

  /**
   * ⚡ Parallel queries
   */
  const [total, menuItems] = await Promise.all([
    prisma.menuItem.count({ where }),
    prisma.menuItem.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.status(200).json({
    status: "success",
    results: menuItems.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: { menuItems },
  });
});

/**
 * Get single item
 */
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

/**
 * Create item (Decimal FIX)
 */
export const createMenuItem = catchAsync(async (req, res, next) => {
  const { price, name, categoryType, imageUrl, description, preparationTime } =
    req.body;

  console.log("Received data:", req.body);

  // Convert values properly
  const priceNum = Number(price);
  const prepTimeNum = Number(preparationTime);

  // Validate numbers
  if (isNaN(priceNum) || isNaN(prepTimeNum)) {
    return next(new AppError("Invalid number input", 400));
  }

  if (!name || !categoryType || !imageUrl || !description) {
    return next(new AppError("All fields are required", 400));
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      price: new Prisma.Decimal(priceNum),
      name,
      category: categoryType,
      imageUrl,
      description,
      preparationTime: prepTimeNum,
    },
  });

  res.status(201).json({
    status: "success",
    data: { menuItem },
  });
});

/**
 * Update item (Decimal FIX)
 */
export const updateMenuItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  const existing = await prisma.menuItem.findUnique({
    where: { id: id as string },
  });

  if (!existing) {
    return next(new AppError("Menu item not found", 404));
  }

  // Fix price if exists
  if (updateData.price !== undefined) {
    updateData.price = new Prisma.Decimal(updateData.price);
  }

  if (!Object.keys(updateData).length) {
    return next(new AppError("No data provided for update", 400));
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

/**
 * Delete item
 */
export const deleteMenuItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const existing = await prisma.menuItem.findUnique({
    where: { id: id as string },
  });

  if (!existing) {
    return next(new AppError("Menu item not found", 404));
  }

  await prisma.menuItem.delete({ where: { id: id as string } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * Admin menus
 */
export const getAdminMenus = catchAsync(async (req, res) => {
  const q = getString(req.query.q);
  const categoryType = getString(req.query.categoryType);
  const pageNumber = Math.max(1, getNumber(req.query.page) || 1);

  const limit = 10;
  const skip = (pageNumber - 1) * limit;

  const where: any = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categoryType) {
    where.category = categoryType;
  }

  const [menus, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.menuItem.count({ where }),
  ]);

  const formattedMenus = menus.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: Number(item.price),
    category: item.category,
    preparationTime: item.preparationTime,
    isFeatured: false,
    imageUrl: item.imageUrl || "",
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  res.status(200).json({
    success: true,
    data: {
      menus: formattedMenus,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
