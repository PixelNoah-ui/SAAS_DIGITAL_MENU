import { Prisma } from "../generated/prisma/client.js";
import { OrderStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/Prisma.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

const SESSION_EXPIRE_MINUTES = Number(process.env.SESSION_EXPIRE_MINUTES ?? 15);
const ORDER_LIMIT_PER_WINDOW = Number(process.env.ORDER_LIMIT_PER_WINDOW ?? 3);
const ORDER_WINDOW_MINUTES = Number(process.env.ORDER_WINDOW_MINUTES ?? 10);

// ============================================
// Order Formatter - Transform Prisma to API
// ============================================

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: any;
  menuItem?: {
    name: string | null;
  } | null;
}

interface Order {
  id: string;
  tableId: string;
  orderSessionId: string | null;
  status: string;
  totalAmount: any;
  createdAt: Date;
  updatedAt: Date;
  table?: {
    id: string;
    tableNumber: number;
    name: string | null;
  } | null;
  items?: OrderItem[];
}

const getActiveSession = async (tableId: string) => {
  const now = new Date();
  return prisma.orderSession.findFirst({
    where: {
      tableId,
      status: "ACTIVE",
      expiresAt: {
        gt: now,
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const expireSession = async (sessionId: string) => {
  return prisma.orderSession.update({
    where: { id: sessionId },
    data: { status: "EXPIRED" },
  });
};

const validateOrderPayload = async (items: any[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Order items are required", 400);
  }

  const validatedItems = items.map((item) => {
    if (!item?.menuItemId || typeof item.menuItemId !== "string") {
      throw new AppError("Each item must include a valid menuItemId", 400);
    }

    if (
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new AppError(
        "Each item must include a positive integer quantity",
        400,
      );
    }

    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    };
  });

  return validatedItems;
};

const parseOrderStatus = (value: string | string[] | undefined) => {
  if (!value) return undefined;
  const status = Array.isArray(value) ? value[0] : value;
  if (!status) return undefined;
  return status.toUpperCase();
};

const validateOrderStatus = (status?: string) => {
  if (!status) return undefined;
  const validStatuses = Object.values(OrderStatus);
  if (!validStatuses.includes(status as any)) {
    throw new AppError(
      `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      400,
    );
  }
  return status as OrderStatus;
};

export const getOrders = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 9;

  const rawStatus = req.query.status as string | undefined;

  const where: any = {};

  // ✅ handle "all"
  if (rawStatus && rawStatus.toLowerCase() !== "all") {
    const normalized = rawStatus.toUpperCase();

    const validStatus = validateOrderStatus(normalized);

    if (validStatus) {
      where.status = validStatus;
    }
  }

  const total = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    include: {
      table: true,
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    tableId: order.tableId,

    // ✅ matches frontend: string
    tableName: `Table ${order.table?.tableNumber ?? "Unknown"}`,

    status: order.status,

    totalAmount: Number(order.totalAmount),

    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),

    itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,

    items: (order.items || []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),

      menuItem: {
        name: item.menuItem?.name || "Unknown Item",
      },
    })),
  }));

  res.status(200).json({
    success: true,
    data: {
      orders: formattedOrders,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
export const getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: id as string },
    include: {
      table: true,
      orderSession: true,
      items: true,
    },
  });

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || typeof status !== "string") {
    return next(new AppError("Status is required", 400));
  }

  const normalizedStatus = status.toUpperCase();
  const validStatus = validateOrderStatus(normalizedStatus);
  if (!validStatus) {
    return next(new AppError("Status is required", 400));
  }

  const order = await prisma.order.findUnique({ where: { id: id as string } });
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  const updatedOrder = await prisma.order.update({
    where: { id: id as string },
    data: { status: validStatus },
    include: {
      table: true,
      orderSession: true,
      items: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: { order: updatedOrder },
  });
});

export const deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({ where: { id: id as string } });
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  await prisma.order.delete({ where: { id: id as string } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const createOrReuseOrderSession = catchAsync(async (req, res, next) => {
  const { tableId } = req.body;
  if (!tableId || typeof tableId !== "string") {
    return next(new AppError("tableId is required", 400));
  }

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table || !table.isActive) {
    return next(new AppError("Table not found or inactive", 404));
  }

  let session = await getActiveSession(tableId);
  if (!session) {
    const now = new Date();
    session = await prisma.orderSession.create({
      data: {
        tableId,
        expiresAt: new Date(now.getTime() + SESSION_EXPIRE_MINUTES * 60_000),
      },
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

export const getOrdersBySession = catchAsync(async (req, res, next) => {
  // Use session from cookie (set by middleware)
  if (!req.session) {
    return next(new AppError("No active session. Please scan QR code.", 401));
  }

  const orders = await prisma.order.findMany({
    where: { orderSessionId: req.session.id },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    status: "success",
    data: { orders },
  });
});

export const createOrder = catchAsync(async (req, res, next) => {
  const { tableId, items, sessionToken } = req.body;
  if (!tableId || typeof tableId !== "string") {
    return next(new AppError("tableId is required", 400));
  }

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table || !table.isActive) {
    return next(new AppError("Table not found or inactive", 404));
  }

  const now = new Date();
  let session = null;

  if (typeof sessionToken === "string") {
    session = await prisma.orderSession.findUnique({
      where: { sessionToken },
    });
  }

  if (!session) {
    session = await getActiveSession(tableId);
  }

  if (!session) {
    session = await prisma.orderSession.create({
      data: {
        tableId,
        expiresAt: new Date(now.getTime() + SESSION_EXPIRE_MINUTES * 60_000),
      },
    });
  }

  if (session.expiresAt <= now || session.status !== "ACTIVE") {
    await expireSession(session.id);
    return next(new AppError("Order session expired", 403));
  }

  const recentOrderCount = await prisma.order.count({
    where: {
      orderSessionId: session.id,
      createdAt: {
        gte: new Date(now.getTime() - ORDER_WINDOW_MINUTES * 60_000),
      },
    },
  });

  if (recentOrderCount >= ORDER_LIMIT_PER_WINDOW) {
    return next(
      new AppError(
        `Too many orders for this session. Limit is ${ORDER_LIMIT_PER_WINDOW} orders per ${ORDER_WINDOW_MINUTES} minutes.`,
        429,
      ),
    );
  }

  const validatedItems = await validateOrderPayload(items);
  const menuItemIds = validatedItems.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      isAvailable: true,
    },
  });

  if (menuItems.length !== new Set(menuItemIds).size) {
    return next(
      new AppError("One or more menu items are invalid or unavailable", 400),
    );
  }

  const menuItemMap = new Map(
    menuItems.map((menuItem) => [menuItem.id, menuItem]),
  );
  let totalAmount = new Prisma.Decimal(0);

  const orderItems = validatedItems.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem) {
      throw new AppError("Invalid menu item in order", 400);
    }

    const expectedPrice = menuItem.price;
    const lineTotal = expectedPrice.mul(item.quantity);
    totalAmount = totalAmount.add(lineTotal);

    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: expectedPrice,
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    return tx.order.create({
      data: {
        tableId,
        orderSessionId: session.id,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });
  });

  res.status(201).json({
    status: "success",
    data: {
      order,
      session,
    },
  });
});
