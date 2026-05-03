declare module "qrcode" {
  interface QRCodeToDataURLOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    type?: string;
  }

  interface QRCodeToBufferOptions extends QRCodeToDataURLOptions {}

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<string>;
  export function toBuffer(
    text: string,
    options?: QRCodeToBufferOptions,
  ): Promise<Buffer>;
  export function toString(
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<string>;
}
