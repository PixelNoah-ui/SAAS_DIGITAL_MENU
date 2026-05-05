"use client";

import { AlertTriangle } from "lucide-react";

interface InvalidPageProps {
  isInvalidQR?: boolean;
}

export default function InvalidPage({ isInvalidQR = true }: InvalidPageProps) {
  const title = isInvalidQR ? "Invalid QR Code" : "Scan QR to Continue";
  const description = isInvalidQR
    ? "This QR code is invalid or expired."
    : "Scan the table QR to start ordering.";

  return (
    <div className="max-w-md mx-auto mt-20 p-6 text-center space-y-5 bg-background shadow rounded-lg">
      {/* Icon */}
      <div className="flex justify-center">
        {isInvalidQR ? (
          <AlertTriangle className="w-10 h-10 text-red-600" />
        ) : (
          <span className="text-4xl">📱</span>
        )}
      </div>

      {/* Text */}
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Tips */}
      <div className="text-sm text-muted-foreground">
        {isInvalidQR ? (
          <p>Check QR or ask staff for help.</p>
        ) : (
          <p>Open camera and scan the QR code.</p>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground">PixelHotel</p>
    </div>
  );
}
