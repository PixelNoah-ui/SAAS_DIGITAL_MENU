import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";

import crypto from "crypto";
import { sendTableQrEmail } from "../utils/generateQrCardImage .js";
import { generateQrCodeDataUrl } from "../utils/generateQrCodeDataUrl.js";
import { buildTableMenuUrl } from "../utils/buildTableMenuUrl.js";
/**
 * Helpers
 */
const getString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const getNumber = (value: unknown): number | undefined => {
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

/**
 * Create a new table
 */

export const createTable = catchAsync(async (req, res) => {
  const { tableNumber, capacity } = req.body;

  // ✅ Validate input
  const tableNum = Number(tableNumber);
  const cap = Number(capacity);

  if (!tableNum || !cap || isNaN(tableNum) || isNaN(cap)) {
    throw new AppError("tableNumber and capacity must be valid numbers", 400);
  }

  // ✅ Check existing table
  const existingTable = await prisma.table.findUnique({
    where: { tableNumber: tableNum },
  });

  if (existingTable) {
    throw new AppError("Table with this number already exists", 400);
  }

  // ✅ Generate secure QR token
  const qrToken = crypto.randomBytes(16).toString("hex");

  // ✅ Create table
  const table = await prisma.table.create({
    data: {
      tableNumber: tableNum,
      capacity: cap,
      qrToken,
      status: "AVAILABLE",
    },
  });

  // ✅ Build menu URL (IMPORTANT: /:qrToken)
  const menuUrl = buildTableMenuUrl(qrToken);

  // ✅ Generate QR Code (base64)
  const qrCodeDataUrl = await generateQrCodeDataUrl(menuUrl);

  // ✅ Get restaurant info
  let restaurantName = "PixelHotel";
  let adminEmail = process.env.EMAIL_USERNAME!;

  const restaurantInfo = await prisma.restaurantInfo.findFirst();
  if (restaurantInfo?.name) {
    restaurantName = restaurantInfo.name;
  }

  // ✅ Send Email
  let emailSent = false;

  try {
    await sendTableQrEmail(
      {
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        qrToken,
        restaurantName,
        menuUrl,
        qrCodeDataUrl,
      },
      adminEmail,
    );

    emailSent = true;
  } catch (error) {
    console.error("Email failed:", error);
  }

  // ✅ Response
  res.status(201).json({
    success: true,
    data: {
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        qrToken,
        menuUrl,
        emailSent,
      },
    },
  });
});
/**
 * Get all tables (admin with pagination and filters)
 */
export const getAdminTables = catchAsync(async (req, res) => {
  const search = getString(req.query.q);
  const status = getString(req.query.status);
  const page = Math.max(1, getNumber(req.query.page) || 1);
  const limit = 10;

  const where: any = {};

  // Search filter
  if (search) {
    where.OR = [{ tableNumber: { equals: getNumber(search) } }];
  }

  // Status filter
  if (status && ["AVAILABLE", "OCCUPIED", "RESERVED"].includes(status)) {
    where.status = status;
  }

  const [tables, total] = await Promise.all([
    prisma.table.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.table.count({ where }),
  ]);

  res.status(200).json({
    success: "true",
    data: {
      tables: tables.map((table) => ({
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Get single table by ID
 */
export const getTable = catchAsync(async (req, res) => {
  const id = req.params.id as string;

  const table = await prisma.table.findUnique({
    where: { id },
  });

  if (!table) {
    throw new AppError("Table not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        qrToken: table.qrToken,
        isActive: table.isActive,
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
      },
    },
  });
});

/**
 * Update table
 */
export const updateTable = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const { tableNumber, capacity, status } = req.body;

  const existingTable = await prisma.table.findUnique({
    where: { id },
  });

  if (!existingTable) {
    throw new AppError("Table not found", 404);
  }

  // Convert to numbers as schema expects Int fields
  const tableNum = tableNumber ? Number(tableNumber) : undefined;
  const cap = capacity ? Number(capacity) : undefined;

  // Check if new tableNumber conflicts with another table
  if (tableNum && tableNum !== existingTable.tableNumber) {
    const conflict = await prisma.table.findUnique({
      where: { tableNumber: tableNum },
    });

    if (conflict) {
      throw new AppError("Table number already in use", 400);
    }
  }

  const updateData: any = {};
  if (tableNum) updateData.tableNumber = tableNum;
  if (cap) updateData.capacity = cap;
  if (status && ["AVAILABLE", "OCCUPIED", "RESERVED"].includes(status)) {
    updateData.status = status;
  }

  const table = await prisma.table.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    data: {
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
      },
    },
  });
});

/**
 * Delete table
 */
export const deleteTable = catchAsync(async (req, res) => {
  const id = req.params.id as string;

  const existingTable = await prisma.table.findUnique({
    where: { id },
  });

  if (!existingTable) {
    throw new AppError("Table not found", 404);
  }

  // Check if table has active orders
  const activeOrders = await prisma.order.count({
    where: {
      tableId: id,
      status: { in: ["PENDING", "PREPARING", "READY"] },
    },
  });

  if (activeOrders > 0) {
    throw new AppError("Cannot delete table with active orders", 400);
  }

  await prisma.table.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: "Table deleted successfully",
  });
});

/**
 * Get table by QR token (for customer scanning)
 */

export const scanTable = catchAsync(async (req, res, next) => {
  const { qrToken } = req.body;

  if (!qrToken) {
    return next(new AppError("QR token is required", 400));
  }

  // ✅ Find table by QR
  const table = await prisma.table.findUnique({
    where: { qrToken },
    select: {
      id: true,
      tableNumber: true,
      capacity: true,
      status: true,
    },
  });

  if (!table) {
    return next(new AppError("Invalid QR code", 404));
  }

  // ❌ NO session created here (important)

  res.status(200).json({
    success: true,
    data: {
      table,
    },
  });
});
