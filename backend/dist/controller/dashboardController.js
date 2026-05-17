import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";
/* ================= HELPERS ================= */
const calcChange = (current, previous) => {
    if (previous === 0 && current === 0)
        return 0;
    if (previous === 0)
        return 100;
    return ((current - previous) / previous) * 100;
};
const formatStat = (value) => ({
    change: `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
    trend: value > 0 ? "up" : value < 0 ? "down" : "neutral",
});
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
    /* ================= AGGREGATES ================= */
    const [currentStats, previousStats, currentCompleted, previousCompleted, totalMenuItems, previousMenuItems,] = await Promise.all([
        prisma.order.aggregate({
            where: currentPeriodWhere,
            _count: { _all: true },
            _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
            where: previousPeriodWhere,
            _count: { _all: true },
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
    /* ================= FIXED VALUES ================= */
    const currentTotalOrders = currentStats._count._all;
    const previousTotalOrders = previousStats._count._all;
    const currentRevenue = Number(currentStats._sum.totalAmount || 0);
    const previousRevenue = Number(previousStats._sum.totalAmount || 0);
    const ordersChange = calcChange(currentTotalOrders, previousTotalOrders);
    const revenueChange = calcChange(currentRevenue, previousRevenue);
    const completedChange = calcChange(currentCompleted, previousCompleted);
    const menuChange = calcChange(totalMenuItems, previousMenuItems);
    /* ================= STATS ================= */
    const stats = [
        {
            title: "Total Orders",
            value: currentTotalOrders.toString(),
            ...formatStat(ordersChange),
        },
        {
            title: "Revenue",
            value: `$${currentRevenue.toFixed(2)}`,
            ...formatStat(revenueChange),
        },
        {
            title: "Completed Orders",
            value: currentCompleted.toString(),
            ...formatStat(completedChange),
        },
        {
            title: "Menu Items",
            value: totalMenuItems.toString(),
            ...formatStat(menuChange),
        },
    ];
    /* ================= CHART ================= */
    let chartDays = 7;
    if (period === "30d")
        chartDays = 14;
    if (period === "365d" || period === "all")
        chartDays = 30;
    const orderGrowth = await Promise.all(Array.from({ length: chartDays }).map(async (_, i) => {
        const baseDate = new Date(now.getTime() - (chartDays - 1 - i) * 86400000);
        const dayStart = new Date(baseDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(baseDate);
        dayEnd.setHours(23, 59, 59, 999);
        const count = await prisma.order.count({
            where: {
                createdAt: { gte: dayStart, lte: dayEnd },
            },
        });
        return {
            day: dayStart.toLocaleDateString("en-US", {
                weekday: "short",
            }),
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
                createdAt: { gte: dayStart, lte: dayEnd },
            },
            _sum: { totalAmount: true },
        });
        return {
            day: dayStart.toLocaleDateString("en-US", {
                weekday: "short",
            }),
            revenue: Number(result._sum.totalAmount || 0),
        };
    }));
    /* ================= RECENT ORDERS ================= */
    const recentOrdersData = await prisma.order.findMany({
        take: 5,
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
    /* ================= RESPONSE ================= */
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