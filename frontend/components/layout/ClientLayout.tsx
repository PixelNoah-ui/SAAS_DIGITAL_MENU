"use client";

import Header from "./Header";
import BottomFooter from "./BottomFooter";
import { Toaster } from "sonner";
import { useTableStore } from "@/store/tableStore";
import InvalidPage from "@/app/InvalidPage/page";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const table = useTableStore((state) => state.table);
  const pathname = usePathname();

  // Check if current path is a QR token scanning path (32 hex characters)
  const isScanningPath = /^\/[a-f0-9]{32}$/.test(pathname);

  return (
    <>
      <Header />
      <main className="pb-20">
        {isScanningPath || table ? (
          children
        ) : (
          <InvalidPage isInvalidQR={false} />
        )}
      </main>
      <BottomFooter />
      <Toaster position="bottom-center" richColors />
    </>
  );
}
