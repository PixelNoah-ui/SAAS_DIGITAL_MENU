import puppeteer from "puppeteer";
import sendEmail from "./sendEmail.js";

/**
 * Generate PRINTABLE QR CARD (PNG)
 */
const generateQrCardImage = async ({
  restaurantName,
  tableNumber,
  capacity,
  qrCodeDataUrl,
}: {
  restaurantName: string;
  tableNumber: number;
  capacity: number;
  qrCodeDataUrl: string;
}): Promise<Buffer> => {
  const html = `
  <html>
    <head>
      <style>
        body {
          margin:0;
          padding:0;
          font-family: Arial, sans-serif;
          display:flex;
          justify-content:center;
          align-items:center;
          height:100vh;
          background:#f5f7fa;
        }

        .card {
          width: 420px;
          border-radius: 20px;
          padding: 25px;
          background: white;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }

        .logo {
          font-size: 22px;
          font-weight: bold;
        }

        .subtitle {
          font-size: 14px;
          color: #777;
          margin-bottom: 15px;
        }

        .table {
          font-size: 20px;
          font-weight: bold;
        }

        .capacity {
          font-size: 13px;
          color: #999;
        }

        .qr {
          margin: 25px 0;
        }

        .scan {
          margin-top: 10px;
          font-size: 14px;
          font-weight: bold;
        }

        .footer {
          font-size: 13px;
          color: #666;
        }
      </style>
    </head>

    <body>
      <div class="card">
        <div class="logo">${restaurantName}</div>
        <div class="subtitle">Digital Ordering System</div>

        <div class="table">Table #${tableNumber}</div>
        <div class="capacity">Capacity: ${capacity}</div>

        <div class="qr">
          <img src="${qrCodeDataUrl}" width="220"/>
        </div>

        <div class="scan">Scan to Order</div>

        <div class="footer">
          No app required • Fast & Easy
        </div>
      </div>
    </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 500,
    height: 650,
    deviceScaleFactor: 2,
  });

  await page.setContent(html);

  // ✅ FIX: Convert Uint8Array → Buffer
  const uint8 = await page.screenshot({ type: "png" });
  const buffer = Buffer.from(uint8);

  await browser.close();

  return buffer;
};

/**
 * Send QR email
 */
export const sendTableQrEmail = async (
  data: {
    tableNumber: number;
    capacity: number;
    qrToken: string;
    restaurantName: string;
    menuUrl: string;
    qrCodeDataUrl: string;
  },
  email: string,
): Promise<void> => {
  const qrCardImage = await generateQrCardImage({
    restaurantName: data.restaurantName,
    tableNumber: data.tableNumber,
    capacity: data.capacity,
    qrCodeDataUrl: data.qrCodeDataUrl,
  });

  const html = `
  <div style="font-family: Arial; background:#f4f6f8; padding:30px;">
    
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

      <div style="background:#111; color:white; padding:20px;">
        <h2 style="margin:0;">${data.restaurantName}</h2>
        <p style="margin:0; font-size:13px;">Table QR Generated</p>
      </div>

      <div style="padding:25px;">
        <h3>Table #${data.tableNumber}</h3>

        <div style="background:#f9f9f9; padding:15px; border-radius:8px;">
          <p><strong>Capacity:</strong> ${data.capacity}</p>
          <p style="font-size:12px;"><strong>Token:</strong> ${data.qrToken}</p>
        </div>

        <div style="text-align:center; margin:25px 0;">
          <img src="${data.qrCodeDataUrl}" width="160"/>
        </div>

        <div style="text-align:center;">
          <a href="${data.menuUrl}" 
             style="background:#111; color:white; padding:12px 18px; text-decoration:none; border-radius:6px;">
            Open Menu
          </a>
        </div>

        <p style="font-size:12px; text-align:center; margin-top:20px;">
          ${data.menuUrl}
        </p>
      </div>

      <div style="background:#fafafa; padding:15px; text-align:center; font-size:12px;">
        Print the attached QR card and place it on the table.
      </div>

    </div>

  </div>
  `;

  await sendEmail({
    email,
    subject: `QR Code - Table #${data.tableNumber}`,
    html,
    attachments: [
      {
        filename: `table-${data.tableNumber}.png`,
        content: qrCardImage,
      },
    ],
  });
};
