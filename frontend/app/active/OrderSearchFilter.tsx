"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

interface OrderSearchFilterLayoutProps {
  children: React.ReactNode;
}

export default function OrderSearchFilterLayout({
  children,
}: OrderSearchFilterLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [optimisticFilters, setOptimisticFilters] = useOptimistic({
    status: searchParams.getAll("status"),
    date_from: searchParams.get("date_from") || undefined,
    date_to: searchParams.get("date_to") || undefined,
    sort: searchParams.get("sort") || "newest",
  });

  const [isPending, startTransition] = useTransition();

  function updateFilters(updates: Partial<typeof optimisticFilters>) {
    const newState = { ...optimisticFilters, ...updates };
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(newState).forEach(([key, value]) => {
      newSearchParams.delete(key);

      if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      } else if (value) {
        newSearchParams.set(key, value);
      }
    });

    newSearchParams.delete("page");

    startTransition(() => {
      setOptimisticFilters(newState);
      router.push(`?${newSearchParams.toString()}`);
    });
  }

  return (
    <main className="group flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start">
      <aside
        className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64"
        data-pending={isPending ? "" : undefined}
      >
        <StatusFilter
          selectedStatuses={optimisticFilters.status}
          updateStatuses={(statuses) => updateFilters({ status: statuses })}
        />
        <DateFilter
          dateFrom={optimisticFilters.date_from}
          dateTo={optimisticFilters.date_to}
          updateDateRange={(dateFrom, dateTo) =>
            updateFilters({ date_from: dateFrom, date_to: dateTo })
          }
        />
      </aside>
      <div
        className={`w-full max-w-7xl space-y-5 group-has-data-pending:animate-pulse`}
        data-pending={isPending ? "" : undefined}
      >
        <div className="flex justify-center lg:justify-end">
          <SortFilter
            sort={optimisticFilters.sort}
            updateSort={(sort) => updateFilters({ sort })}
          />
        </div>
        {children}
      </div>
    </main>
  );
}

interface StatusFilterProps {
  selectedStatuses: string[];
  updateStatuses: (statuses: string[]) => void;
}

function StatusFilter({ selectedStatuses, updateStatuses }: StatusFilterProps) {
  const statuses = [
    { name: "Pending", value: "PENDING" },
    { name: "Preparing", value: "PREPARING" },
    { name: "Ready", value: "READY" },
    { name: "Delivered", value: "DELIVERED" },
  ];

  return (
    <div className="space-y-3">
      <div className="font-bold">Order Status</div>
      <ul className="space-y-1.5">
        {statuses.map((status) => (
          <li key={status.value}>
            <label className="flex cursor-pointer items-center gap-2 font-medium">
              <Checkbox
                id={status.value}
                checked={selectedStatuses.includes(status.value)}
                onCheckedChange={(checked) => {
                  updateStatuses(
                    checked
                      ? [...selectedStatuses, status.value]
                      : selectedStatuses.filter((s) => s !== status.value),
                  );
                }}
              />
              <span className="line-clamp-1 break-all">{status.name}</span>
            </label>
          </li>
        ))}
      </ul>

      {selectedStatuses.length > 0 && (
        <button
          onClick={() => updateStatuses([])}
          className="text-sm text-primary hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface DateFilterProps {
  dateFrom: string | undefined;
  dateTo: string | undefined;
  updateDateRange: (from: string | undefined, to: string | undefined) => void;
}

function DateFilter({ dateFrom, dateTo, updateDateRange }: DateFilterProps) {
  const [fromInput, setFromInput] = useState(() => dateFrom || "");
  const [toInput, setToInput] = useState(() => dateTo || "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateDateRange(fromInput, toInput);
  }

  return (
    <div className="space-y-3">
      <div className="font-bold">Date Range</div>
      <form className="flex flex-col gap-2" onSubmit={onSubmit}>
        <Input
          type="date"
          name="from"
          placeholder="From"
          value={fromInput}
          onChange={(e) => setFromInput(e.target.value)}
        />
        <Input
          type="date"
          name="to"
          placeholder="To"
          value={toInput}
          onChange={(e) => setToInput(e.target.value)}
        />
        <Button type="submit" className="w-full rounded-none">
          Apply
        </Button>
      </form>
      {(dateFrom || dateTo) && (
        <button
          onClick={() => updateDateRange(undefined, undefined)}
          className="text-sm text-primary hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface SortFilterProps {
  sort: string | undefined;
  updateSort: (value: string) => void;
}

function SortFilter({ sort, updateSort }: SortFilterProps) {
  return (
    <Select value={sort || "newest"} onValueChange={updateSort}>
      <SelectTrigger className="w-fit gap-2 text-start rounded-none">
        <span>
          Sort by: <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-none">
        <SelectItem value="newest">Newest First</SelectItem>
        <SelectItem value="oldest">Oldest First</SelectItem>
        <SelectItem value="total_desc">Highest Total</SelectItem>
        <SelectItem value="total_asc">Lowest Total</SelectItem>
      </SelectContent>
    </Select>
  );
}
