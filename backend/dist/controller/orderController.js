import { Prisma } from "../generated/prisma/client.js";
import { OrderStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/Prisma.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
const SESSION_EXPIRE_MINUTES = Number(process.env.SESSION_EXPIRE_MINUTES ?? 15);
const ORDER_LIMIT_PER_WINDOW = Number(process.env.ORDER_LIMIT_PER_WINDOW ?? 3);
const ORDER_WINDOW_MINUTES = Number(process.env.ORDER_WINDOW_MINUTES ?? 10);
const getActiveSession = async (tableId) => {
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
const expireSession = async (sessionId) => {
    return prisma.orderSession.update({
        where: { id: sessionId },
        data: { status: "EXPIRED" },
    });
};
const validateOrderPayload = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Order items are required", 400);
    }
    const validatedItems = items.map((item) => {
        if (!item?.menuItemId || typeof item.menuItemId !== "string") {
            throw new AppError("Each item must include a valid menuItemId", 400);
        }
        if (typeof item.quantity !== "number" ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0) {
            throw new AppError("Each item must include a positive integer quantity", 400);
        }
        return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
        };
    });
    return validatedItems;
};
const parseOrderStatus = (value) => {
    if (!value)
        return undefined;
    const status = Array.isArray(value) ? value[0] : value;
    if (!status)
        return undefined;
    return status.toUpperCase();
};
const validateOrderStatus = (status) => {
    if (!status)
        return undefined;
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
        throw new AppError(`Invalid status. Valid statuses are: ${validStatuses.join(", ")}`, 400);
    }
    return status;
};
const PAGE_SIZE = 10;
export const getAdminOrders = catchAsync(async (req, res) => {
    const q = req.query.q?.toString() || "";
    const status = req.query.status?.toString();
    const page = Number(req.query.page || 1);
    const skip = (page - 1) * PAGE_SIZE;
    // ---------------------------------
    // Build where clause
    // ---------------------------------
    const where = {};
    // Status filter
    if (status && status.toUpperCase() !== "ALL") {
        where.status = status;
    }
    // Search
    if (q) {
        where.OR = [];
        // Search by table number
        if (!isNaN(Number(q))) {
            where.OR.push({
                table: {
                    tableNumber: Number(q),
                },
            });
        }
        // Search by menu item name
        where.OR.push({
            items: {
                some: {
                    menuItem: {
                        name: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                },
            },
        });
    }
    // ---------------------------------
    // Total count
    // ---------------------------------
    const total = await prisma.order.count({
        where,
    });
    // ---------------------------------
    // Get orders
    // ---------------------------------
    const orders = await prisma.order.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            table: true,
            items: {
                include: {
                    menuItem: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    // ---------------------------------
    // Format response
    // ---------------------------------
    const formattedOrders = orders.map((order) => ({
        id: order.id,
        tableId: order.tableId,
        tableName: `Table ${order.table?.tableNumber ?? "Unknown"}`,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        itemCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
        items: order.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            menuItem: {
                name: item.menuItem?.name || "Unknown Item",
            },
        })),
    }));
    return res.status(200).json({
        success: true,
        data: {
            orders: formattedOrders,
            pagination: {
                total,
                totalPages: Math.ceil(total / PAGE_SIZE),
            },
        },
    });
});
export const getOrders = catchAsync(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 9;
    const rawStatus = req.query.status;
    const where = {};
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
        isRead: order.isRead,
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
        where: { id: id },
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
    const order = await prisma.order.findUnique({ where: { id: id } });
    if (!order) {
        return next(new AppError("Order not found", 404));
    }
    const updatedOrder = await prisma.order.update({
        where: { id: id },
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
    const order = await prisma.order.findUnique({ where: { id: id } });
    if (!order) {
        return next(new AppError("Order not found", 404));
    }
    await prisma.order.delete({ where: { id: id } });
    res.status(204).json({
        status: "success",
        data: null,
    });
});
export const getUnreadOrderCount = catchAsync(async (req, res) => {
    const count = await prisma.order.count({
        where: { isRead: false },
    });
    res.status(200).json({
        count,
    });
});
export const markOrdersRead = catchAsync(async (req, res) => {
    await prisma.order.updateMany({
        where: { isRead: false },
        data: { isRead: true },
    });
    res.status(200).json({
        status: "success",
        data: { markedRead: true },
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
        // Return empty orders instead of error for better UX
        return res.status(200).json({
            status: "success",
            data: {
                orders: [],
                pagination: {
                    total: 0,
                    totalPages: 0,
                    currentPage: 1,
                },
            },
        });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 10; // Orders per page
    const where = { orderSessionId: req.session.id };
    // Status filter - handle multiple statuses
    const rawStatus = req.query.status;
    if (rawStatus && rawStatus.length > 0) {
        const statuses = Array.isArray(rawStatus) ? rawStatus : [rawStatus];
        const validStatuses = Object.values(OrderStatus);
        const filteredStatuses = statuses
            .map((status) => status.toUpperCase())
            .filter((status) => validStatuses.includes(status));
        if (filteredStatuses.length > 0) {
            where.status = {
                in: filteredStatuses,
            };
        }
    }
    // Date range filter
    const dateFrom = req.query.date_from;
    const dateTo = req.query.date_to;
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
            where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
            where.createdAt.lte = new Date(dateTo);
        }
    }
    // Sort
    const sort = req.query.sort;
    let orderBy = { createdAt: "desc" };
    if (sort === "oldest") {
        orderBy = { createdAt: "asc" };
    }
    else if (sort === "total_asc") {
        orderBy = { totalAmount: "asc" };
    }
    else if (sort === "total_desc") {
        orderBy = { totalAmount: "desc" };
    }
    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
        where,
        include: {
            items: {
                include: {
                    menuItem: true,
                },
            },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
    });
    res.status(200).json({
        status: "success",
        data: {
            orders,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        },
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
        return next(new AppError(`Too many orders for this session. Limit is ${ORDER_LIMIT_PER_WINDOW} orders per ${ORDER_WINDOW_MINUTES} minutes.`, 429));
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
        return next(new AppError("One or more menu items are invalid or unavailable", 400));
    }
    const menuItemMap = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));
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
                isRead: false,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: true,
            },
        });
    });
    const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
            table: true,
            orderSession: true,
            items: {
                include: {
                    menuItem: true,
                },
            },
        },
    });
    res.status(201).json({
        status: "success",
        data: {
            order: fullOrder ?? order,
            session,
        },
    });
});
//# sourceMappingURL=orderController.js.map