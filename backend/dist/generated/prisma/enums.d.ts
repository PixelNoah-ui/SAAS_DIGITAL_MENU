export declare const OrderStatus: {
    readonly PENDING: "PENDING";
    readonly PREPARING: "PREPARING";
    readonly READY: "READY";
    readonly DELIVERED: "DELIVERED";
    readonly CANCELLED: "CANCELLED";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const OrderSessionStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly EXPIRED: "EXPIRED";
    readonly CLOSED: "CLOSED";
};
export type OrderSessionStatus = (typeof OrderSessionStatus)[keyof typeof OrderSessionStatus];
export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly STAFF: "STAFF";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const TableStatus: {
    readonly AVAILABLE: "AVAILABLE";
    readonly OCCUPIED: "OCCUPIED";
    readonly RESERVED: "RESERVED";
};
export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus];
//# sourceMappingURL=enums.d.ts.map