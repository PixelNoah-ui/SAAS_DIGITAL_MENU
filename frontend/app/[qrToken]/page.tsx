"use client";

import { useParams, useRouter } from "next/navigation";
import { useScanTable } from "@/hooks/useScanTable";
import { useEffect } from "react";
import Loading from "../loading";
import InvalidPage from "../InvalidPage/page";
import { useTableStore } from "@/store/tableStore";

export default function QrTokenPage() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const router = useRouter();

  const setTable = useTableStore((state) => state.setTable);

  const { isLoading, isError, data, isSuccess } = useScanTable(qrToken);

  useEffect(() => {
    if (isSuccess && data?.data?.table) {
      // ✅ store table in Zustand
      setTable(data.data.table);

      // redirect to home
      router.replace("/");
    }
  }, [isSuccess, data, router, setTable]);

  if (isError) return <InvalidPage />;

  if (isLoading) return <Loading />;

  return null;
}
