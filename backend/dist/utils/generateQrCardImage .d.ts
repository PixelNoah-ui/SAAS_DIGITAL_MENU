/**
 * Send QR email
 */
export declare const sendTableQrEmail: (data: {
    tableNumber: number;
    capacity: number;
    qrToken: string;
    restaurantName: string;
    menuUrl: string;
    qrCodeDataUrl: string;
}, email: string) => Promise<void>;
//# sourceMappingURL=generateQrCardImage%20.d.ts.map