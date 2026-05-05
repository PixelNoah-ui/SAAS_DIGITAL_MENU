import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Provider";
import ClientLayout from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PixelHotel Digital Menu",
    template: "%s | PixelHotel",
  },
  description:
    "Scan QR codes to access the digital menu, place orders, and track them in real-time with PixelHotel.",

  keywords: [
    "Digital Menu",
    "QR Code Ordering",
    "Restaurant System",
    "Hotel Ordering",
    "PixelHotel",
  ],

  authors: [{ name: "PixelHotel" }],

  icons: {
    icon: "/icons/logo.svg",
    shortcut: "/icons/logo.svg",
    apple: "/icons/logo.svg",
  },

  openGraph: {
    title: "PixelHotel Digital Menu",
    description:
      "Fast and seamless QR-based ordering system for restaurants and hotels.",
    url: "https://pixelhotel.com", // change this
    siteName: "PixelHotel",
    images: [
      {
        url: "/icons/logo.svg",
        width: 512,
        height: 512,
        alt: "PixelHotel Logo",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PixelHotel Digital Menu",
    description: "Scan, order, and track your food easily with PixelHotel.",
    images: ["/icons/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
