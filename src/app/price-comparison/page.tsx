"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { companyUnits, items, priceRecords, suppliers } from "@/data/demo-data";
import type { PriceRecord } from "@/types";

type CompareMode = "latest" | "selected-date";

const latestDemoDate = priceRecords.reduce(
  (latest, record) => (record.effectiveDate > latest ? record.effectiveDate : latest),
  "",
);

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "BDT" ? 2 : 4,
  }).format(value);

const ageInDays = (date: string) =>
  Math.floor((Date.now() - new Date(date + "T00:00:00").getTime()) / 86_400_000);

const comparableUnit = (record: PriceRecord, itemUnit: string) =>
  record.measurementUnit.trim().toLowerCase() === itemUnit.trim().toLowerCase();

export default function PriceComparisonPage() {
  const [itemId, setItemId] = useState(items.find((item) => item.active)?.id ?? "");
  const [mode, setMode] = useState<CompareMode>("latest");
  const [selectedDate, setSelectedDate] = useState(latestDemoDate);
  const [unitFilter, setUnitFilter] = useState("all");
  const [supplierTypeFilter, setSupplierTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [baselineKey, setBaselineKey] = useState("auto");

  const selectedItem = items.find((item) => item.id === itemId);

  const rows = useMemo(() => {
    if (!selectedItem) return [];

    const query = search.trim().toLowerCase();
    return suppliers
      .filter((supplier) => supplier.active)
      .filter((supplier) => supplierTypeFilter === "all" || supplier.type === supplierTypeFilter)
      .filter((supplier) =>
        !query ||
        supplier.name.toLowerCase().includes(query) ||
        supplier.code.toLowerCase().includes(query) ||
        supplier.country.toLowerCase().includes(query),
      )
      .flatMap((supplier) =>
        companyUnits
          .filter((unit) => unitFilter === "all" || unit.id === unitFilter)
          .map((unit) => {
            const matches = priceRecords
              .filter(
                (record) =>
                  record.itemId === itemId &&
                  record.supplierId === supplier.id &&
                  record.companyUnitId === unit.id &&
                  (mode === "latest" || record.effectiveDate === selectedDate),
              )
              .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

            const record = matches[0] ?? null;
            const unitMatches = record ? comparableUnit(record, selectedItem.unitOfMeasure) : false;
            const bdtPrice = record
              ? record.currency === "BDT"
                ? record.unitPrice
                : record.exchangeRateToBdt && record.exchangeRateToBdt > 0
                  ? record.unitPrice * record.exchangeRateToBdt
                  : null
              : null;

            return {
              key: `${supplier.id}::${unit.id}`,
              supplier,
              unit,
              record,
              unitMatches,
              bdtPrice,
              isStale: record ? ageInDays(record.effectiveDate) > 30 : false,
            };
          }),
      );
  }, [itemId, mode, selectedDate, unitFilter, supplierTypeFilter, search, selectedItem]);

  const baselineOptions = rows.filter(
    (row) => row.record && row.unitMatches && row.bdtPrice !== null,
  );
  const baseline =
    baselineOptions.find((row) => row.key === baselineKey) ??
    baselineOptions[0] ??
    null;
  const rankedRows = rows.filter(
    (row) => row.record && row.unitMatches && row.bdtPrice !== null,
  );
  const lowestKey = rankedRows.length
    ? [...rankedRows].sort((a, b) => (a.bdtPrice ?? Infinity) - (b.bdtPrice ?? Infinity))[0].key
    : null;
  const recordedCount = rows.filter((row) => row.record).length;
  const missingCount = rows.length - recordedCount;

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to dashboard" className="rounded-lg border border-line p-2 text-muted hover:bg-canvas">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <p className="text-sm font-bold">Price comparison</p>
            <p className="mt-0.5 text-[11px] text-muted">Compare supplier offers across company units</p>
          </div>
        </div>
        <span className="rounded-full bg-[#fff3df] px-3 py-1.5 text-[10px] font-semibold text-[#96631a]">Demo data</span>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Supplier analysis</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Price comparison</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Compare like-for-like prices in BDT where a valid exchange rate is available. Each row shows its actual effective date.
            </p>
          </div>
          <Link href="/price-records" className="inline-flex h-10 items-center justify-center rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink hover:bg-canvas">
            Manage price records
          </Link>
        </div>

        <section className="mb-5 rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">
              Item
              <select value={itemId} onChange={(event) => { setItemId(event.target.value); setBaselineKey("auto"); }} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal outline-none focus:border-brand">
                {items.filter((item) => item.active).map((item) => (
                  <option key={item.id} value={item.id}>{item.code} — {item.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">
              Company unit
              <select value={unitFilter} onChange={(event) => { setUnitFilter(event.target.value); setBaselineKey("auto"); }} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal outline-none focus:border-brand">
                <option value="all">All company units</option>
                {companyUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">
              Supplier type
              <select value={supplierTypeFilter} onChange={(event) => { setSupplierTypeFilter(event.target.value); setBaselineKey("auto"); }} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal outline-none focus:border-brand">
                <option value="all">Local & overseas</option>
                <option value="local">Local suppliers</option>
                <option value="overseas">Overseas suppliers</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">
              Search supplier
              <span className="flex h-10 items-center gap-2 rounded-lg border border-line px-3">
                <Search size={14} className="text-muted" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, code or country" className="min-w-0 flex-1 text-xs font-normal outline-none" />
              </span>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#4e5b55]">Comparison mode</p>
              <div className="inline-flex rounded-lg bg-canvas p-1">
                <button type="button" onClick={() => { setMode("latest"); setBaselineKey("auto"); }} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${mode === "latest" ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"}`}>Latest available</button>
                <button type="button" onClick={() => { setMode("selected-date"); setBaselineKey("auto"); }} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${mode === "selected-date" ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"}`}>Selected date</button>
              </div>
              <p className="mt-2 max-w-xl text-[11px] leading-5 text-muted">
                {mode === "latest"
                  ? "Uses the latest record for each supplier and company unit. Dates may differ; stale prices are flagged."
                  : "Shows records from this date only. Missing prices stay missing—no other date is substituted."}
              </p>
            </div>
            {mode === "selected-date" && (
              <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">
                Effective date
                <span className="flex h-10 items-center gap-2 rounded-lg border border-line px-3">
                  <CalendarDays size={14} className="text-muted" />
                  <input type="date" value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setBaselineKey("auto"); }} className="text-xs font-normal outline-none" />
                </span>
              </label>
            )}
            <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55] lg:min-w-[270px]">
              Reference price
              <select value={baseline?.key ?? "auto"} onChange={(event) => setBaselineKey(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal outline-none focus:border-brand" disabled={!baselineOptions.length}>
                {!baselineOptions.length && <option value="auto">No comparable reference available</option>}
                {baselineOptions.map((row) => (
                  <option key={row.key} value={row.key}>{row.supplier.name} · {row.unit.name} · {row.record?.effectiveDate}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Supplier/unit combinations" value={String(rows.length)} detail="Included by current filters" icon={<Building2 size={17} />} />
          <SummaryCard label="Prices recorded" value={String(recordedCount)} detail={`${missingCount} without a matching record`} icon={<CheckCircle2 size={17} />} />
          <SummaryCard label="Comparable BDT prices" value={String(rankedRows.length)} detail="Matching unit and valid conversion" icon={<TrendingDown size={17} />} />
        </div>

        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
          <div className="flex flex-col gap-2 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-bold">{selectedItem?.name ?? "Price comparison"}</h2>
              <p className="mt-1 text-xs text-muted">{selectedItem?.code} · {selectedItem?.specification} · Base unit: {selectedItem?.unitOfMeasure}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted"><SlidersHorizontal size={14} /> {mode === "latest" ? "Latest record per supplier/unit" : `Exact date: ${selectedDate || "not selected"}`}</div>
          </div>
          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted">No suppliers match the current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-canvas text-[10px] uppercase tracking-wider text-muted">
                  <tr>
                    {["Supplier", "Company unit", "Effective date", "Original price", "BDT equivalent", "Difference vs reference", "Difference %", "Status"].map((heading) => (
                      <th key={heading} className="px-4 py-3.5 font-semibold first:pl-6">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((row) => {
                    const price = row.bdtPrice;
                    const difference = price !== null && baseline?.bdtPrice !== null && baseline?.bdtPrice !== undefined && row.unitMatches
                      ? price - baseline.bdtPrice
                      : null;
                    const percent = difference !== null && baseline?.bdtPrice
                      ? (difference / baseline.bdtPrice) * 100
                      : null;
                    const isBaseline = row.key === baseline?.key && Boolean(row.record);
                    const status = !row.record
                      ? mode === "selected-date" ? "No record for selected date" : "No price recorded"
                      : !row.unitMatches
                        ? `Unit mismatch · ${row.record.measurementUnit}`
                        : price === null
                          ? "Exchange rate missing"
                          : row.isStale && mode === "latest"
                            ? "Stale price"
                            : "Comparable";

                    return (
                      <tr key={row.key} className={`transition hover:bg-[#fbfcfb] ${row.key === lowestKey ? "bg-brand-soft/40" : ""}`}>
                        <td className="px-4 py-4 pl-6">
                          <p className="text-xs font-semibold">{row.supplier.name}</p>
                          <p className="mt-1 text-[10px] text-muted">{row.supplier.type === "local" ? "Local" : "Overseas"} · {row.supplier.country}</p>
                        </td>
                        <td className="px-4 py-4 text-xs">{row.unit.name}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs">{row.record?.effectiveDate ?? "—"}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold">{row.record ? money(row.record.unitPrice, row.record.currency) + " / " + row.record.measurementUnit : "—"}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs">{price === null ? "—" : money(price, "BDT")}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs">
                          {difference === null ? "—" : difference === 0 ? money(0, "BDT") : <span className={difference < 0 ? "font-semibold text-brand" : "font-semibold text-[#b45345]"}>{difference > 0 ? "+" : "−"}{money(Math.abs(difference), "BDT")}</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs">
                          {percent === null ? "—" : <span className={percent < 0 ? "flex items-center gap-1 font-semibold text-brand" : percent > 0 ? "flex items-center gap-1 font-semibold text-[#b45345]" : "font-semibold text-muted"}>{percent < 0 ? <ArrowDownRight size={13} /> : percent > 0 ? <ArrowUpRight size={13} /> : null}{percent > 0 ? "+" : ""}{percent.toFixed(2)}%</span>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === "Comparable" ? "bg-brand-soft text-brand-dark" : status === "Stale price" ? "bg-[#fff3df] text-[#96631a]" : status.startsWith("No record") || status === "No price recorded" ? "bg-canvas text-muted" : "bg-[#fff0ee] text-[#a8483d]"}`}>{status}</span>
                            {isBaseline && <span className="text-[10px] font-semibold text-[#326ca8]">Reference price</span>}
                            {row.key === lowestKey && <span className="text-[10px] font-semibold text-brand">Lowest comparable</span>}
                            {row.record && mode === "latest" && row.isStale && <span className="text-[10px] text-muted">Older than 30 days</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-line px-5 py-3 text-[10px] leading-5 text-muted sm:px-6">
            Comparisons use BDT equivalents only when a stored exchange rate is available and measurement units match. Foreign-currency prices retain their original value; historical exchange rates are not refreshed automatically. All data is demo-only and resets on refresh.
          </div>
        </section>

        <footer className="flex flex-col gap-2 py-6 text-[10px] text-[#9aa49e] sm:flex-row sm:items-center sm:justify-between">
          <span>Price Tracker · Comparison module</span>
          <span className="flex items-center gap-1.5"><TrendingUp size={13} /> Latest available and selected-date modes</span>
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2 text-xs text-muted">{icon}{label}</div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-[11px] text-muted">{detail}</p>
    </div>
  );
}
