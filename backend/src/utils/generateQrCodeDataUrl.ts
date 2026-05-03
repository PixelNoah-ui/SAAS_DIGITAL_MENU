import QRCode from "qrcode";

export const generateQrCodeDataUrl = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: "H",
    });
  } catch (error) {
    console.error("QR generation error:", error);
    throw new Error("Failed to generate QR code");
  }
};
