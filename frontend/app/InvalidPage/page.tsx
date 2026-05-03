"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InvalidPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-muted px-4">
      <div className="max-w-md w-full bg-background border rounded-2xl shadow-lg p-8 text-center space-y-6">
        {/* ICON */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-100">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* TITLE */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Invalid QR Code
          </h1>

          <p className="text-muted-foreground text-sm">
            This QR code is either expired, incorrect, or not registered in the
            system.
          </p>
        </div>

        {/* INFO BOX */}
        <div className="bg-muted rounded-lg p-4 text-left text-sm space-y-1">
          <p>• Please check the QR and try again</p>
          <p>• Ask staff for a valid table QR</p>
          <p>• Make sure camera scan is clear</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3">
          <Button className="w-full" onClick={() => router.push("/")}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-muted-foreground">
          PixelHotel Digital Ordering System
        </p>
      </div>
    </div>
  );
}
