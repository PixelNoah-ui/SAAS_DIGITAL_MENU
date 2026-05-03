import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";
/* ================= CONTROLLER ================= */
export const getDashboard = catchAsync(async (req, res) => {
    const period = req.query.period || "30d";
    let daysToCompare = 30;
    let comparisonDays = 30;
    switch (period) {
        case "7d":
            daysToCompare = 7;
            comparisonDays = 7;
            break;
        case "30d":
            daysToCompare = 30;
            comparisonDays = 30;
            break;
        case "365d":
            daysToCompare = 365;
            comparisonDays = 365;
            break;
        case "all":
            daysToCompare = 0;
            comparisonDays = 0;
            break;
        default:
            daysToCompare = 30;
            comparisonDays = 30;
    }
    const now = new Date();
    const currentPeriodStart = daysToCompare > 0
        ? new Date(now.getTime() - daysToCompare * 86400000)
        : undefined;
    const previousPeriodStart = comparisonDays > 0 && currentPeriodStart
        ? new Date(now.getTime() - (daysToCompare + comparisonDays) * 86400000)
        : undefined;
    const currentPeriodWhere = currentPeriodStart
        ? { createdAt: { gte: currentPeriodStart } }
        : {};
    const previousPeriodWhere = previousPeriodStart && currentPeriodStart
        ? { createdAt: { gte: previousPeriodStart, lt: currentPeriodStart } }
        : {};
    const [currentStats, previousStats, currentCompleted, previousCompleted, totalMenuItems, previousMenuItems,] = await Promise.all([
        prisma.order.aggregate({
            where: currentPeriodWhere,
            _count: true,
            _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
            where: previousPeriodWhere,
            _count: true,
            _sum: { totalAmount: true },
        }),
        prisma.order.count({
            where: { ...currentPeriodWhere, status: "DELIVERED" },
        }),
        prisma.order.count({
            where: { ...previousPeriodWhere, status: "DELIVERED" },
        }),
        prisma.menuItem.count(),
        prisma.menuItem.count({
            where: currentPeriodStart
                ? { createdAt: { lt: currentPeriodStart } }
                : {},
        }),
    ]);
    const currentTotalOrders = currentStats._count;
    const previousTotalOrders = previousStats._count;
    const currentRevenue = Number(currentStats._sum.totalAmount || 0);
    const previousRevenue = Number(previousStats._sum.totalAmount || 0);
    const ordersChange = previousTotalOrders > 0
        ? (((currentTotalOrders - previousTotalOrders) / previousTotalOrders) *
            100).toFixed(1)
        : "100";
    const revenueChange = previousRevenue > 0
        ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
        : "100";
    const completedChange = previousCompleted > 0
        ? (((currentCompleted - previousCompleted) / previousCompleted) *
            100).toFixed(1)
        : "100";
    const menuChange = previousMenuItems > 0
        ? (((totalMenuItems - previousMenuItems) / previousMenuItems) *
            100).toFixed(1)
        : "100";
    const stats = [
        {
            title: "Total Orders",
            value: currentTotalOrders.toString(),
            change: `${Number(ordersChange) >= 0 ? "+" : ""}${ordersChange}%`,
            trend: Number(ordersChange) >= 0 ? "up" : "down",
        },
        {
            title: "Revenue",
            value: `$${currentRevenue.toFixed(2)}`,
            change: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`,
            trend: Number(revenueChange) >= 0 ? "up" : "down",
        },
        {
            title: "Completed Orders",
            value: currentCompleted.toString(),
            change: `${Number(completedChange) >= 0 ? "+" : ""}${completedChange}%`,
            trend: Number(completedChange) >= 0 ? "up" : "down",
        },
        {
            title: "Menu Items",
            value: totalMenuItems.toString(),
            change: `${Number(menuChange) >= 0 ? "+" : ""}${menuChange}%`,
            trend: Number(menuChange) >= 0 ? "up" : "down",
        },
    ];
    let chartDays = 7;
    if (period === "7d")
        chartDays = 7;
    else if (period === "30d")
        chartDays = 14;
    else if (period === "365d")
        chartDays = 30;
    else if (period === "all")
        chartDays = 30;
    const orderGrowth = await Promise.all(Array.from({ length: chartDays }).map(async (_, i) => {
        const baseDate = new Date(now.getTime() - (chartDays - 1 - i) * 86400000);
        const dayStart = new Date(baseDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(baseDate);
        dayEnd.setHours(23, 59, 59, 999);
        const count = await prisma.order.count({
            where: {
                createdAt: {
                    gte: dayStart,
                    lte: dayEnd,
                },
            },
        });
        return {
            day: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
            orders: count,
        };
    }));
    const revenueGrowth = await Promise.all(Array.from({ length: chartDays }).map(async (_, i) => {
        const baseDate = new Date(now.getTime() - (chartDays - 1 - i) * 86400000);
        const dayStart = new Date(baseDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(baseDate);
        dayEnd.setHours(23, 59, 59, 999);
        const result = await prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: dayStart,
                    lte: dayEnd,
                },
            },
            _sum: { totalAmount: true },
        });
        return {
            day: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
            revenue: Number(result._sum.totalAmount || 0),
        };
    }));
    const recentOrdersData = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
            table: { select: { tableNumber: true } },
        },
    });
    const recentOrders = recentOrdersData.map((order) => ({
        id: order.id,
        customer: `Table ${order.table.tableNumber}`,
        total: `$${Number(order.totalAmount).toFixed(2)}`,
        status: order.status,
    }));
    res.status(200).json({
        success: true,
        data: {
            stats,
            orderGrowth,
            revenueGrowth,
            recentOrders,
        },
    });
});
//# sourceMappingURL=dashboardController.js.map