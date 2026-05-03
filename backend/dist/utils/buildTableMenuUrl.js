export const buildTableMenuUrl = (qrToken) => {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return `${baseUrl}/${qrToken}`; // IMPORTANT: /:qrToken
};
//# sourceMappingURL=buildTableMenuUrl.js.map