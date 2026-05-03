"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Table = {
  id: string;
  tableNumber?: number;
};

type TableStore = {
  table: Table | null;
  setTable: (table: Table) => void;
  clearTable: () => void;
};

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      table: null,
      setTable: (table) => set({ table }),
      clearTable: () => set({ table: null }),
    }),
    {
      name: "table-storage",
    },
  ),
);
