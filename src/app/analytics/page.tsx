"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  Filter,
  Package,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categories, companyUnits, items, priceRecords, suppliers } from "@/data/demo-data";
import { getPriceInBdt } from "@/lib/price-calculations";
import type { PriceRecord } from "@/types";

const money = (value: number, currency = "BDT") =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "BDT" ? 2 : 4,
  }).format(value);

const dateLabel = (value: string) =>
  new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const monthLabel = (value: string) =>
  new Date(value + "-01T00:00:00").toLocaleDateString("en", {
    month: "short",
    year: "2-digit",
  });

function compatible(record: PriceRecord, itemId: string) {
  const item = items.find((entry) => entry.id === itemId);
  return Boolean(item && record.measurementUnit.trim().toLowerCase() === item.unitOfMeasure.trim().toLowerCase());
}

export default function AnalyticsPage() {
  const [itemFilter, setItemFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [supplierType, setSupplierType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredRecords = useMemo(() => {
    return priceRecords.filter((record) => {
      const item = items.find((entry) => entry.id === record.itemId);
      const supplier = suppliers.find((entry) => entry.id === record.supplierId);
      return (
        (itemFilter === "all" || record.itemId === itemFilter) &&
        (categoryFilter === "all" || item?.categoryId === categoryFilter) &&
        (supplierFilter === "all" || record.supplierId === supplierFilter) &&
        (unitFilter === "all" || record.companyUnitId === unitFilter) &&
        (supplierType === "all" || supplier?.type === supplierType) &&
        (!fromDate || record.effectiveDate >= fromDate) &&
        (!toDate || record.effectiveDate <= toDate)
      );
    }).sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  }, [itemFilter, categoryFilter, supplierFilter, unitFilter, supplierType, fromDate, toDate]);

  const trendData = useMemo(() => {
    if (itemFilter === "all") return [];
    const grouped = new Map<string, { sum: number; count: number; local: number; localCount: number; overseas: number; overseasCount: number }>();
    filteredRecords.forEach((record) => {
      const price = getPriceInBdt(record);
      if (price === null || !compatible(record, record.itemId)) return;
      const month = record.effectiveDate.slice(0, 7);
      const supplier = suppliers.find((entry) => entry.id === record.supplierId);
      const group = grouped.get(month) ?? { sum: 0, count: 0, local: 0, localCount: 0, overseas: 0, overseasCount: 0 };
      group.sum += price;
      group.count += 1;
      if (supplier?.type === "local") {
        group.local += price;
        group.localCount += 1;
      } else if (supplier?.type === "overseas") {
        group.overseas += price;
        group.overseasCount += 1;
      }
      grouped.set(month, group);
    });
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, group]) => ({
      month: monthLabel(month),
      average: Number((group.sum / group.count).toFixed(2)),
      local: group.localCount ? Number((group.local / group.localCount).toFixed(2)) : null,
      overseas: group.overseasCount ? Number((group.overseas / group.overseasCount).toFixed(2)) : null,
      count: group.count,
    }));
  }, [filteredRecords, itemFilter]);

  const supplierData = useMemo(() => {
    if (itemFilter === "all") return [];
    const latest = new Map<string, PriceRecord>();
    filteredRecords.forEach((record) => {
      const key = record.supplierId;
      const previous = latest.get(key);
      if (!previous || record.effectiveDate > previous.effectiveDate) latest.set(key, record);
    });
    return [...latest.values()].map((record) => ({
      supplier: suppliers.find((entry) => entry.id === record.supplierId)?.name ?? "Unknown",
      price: getPriceInBdt(record) !== null && compatible(record, record.itemId) ? Number(getPriceInBdt(record)!.toFixed(2)) : null,
      currency: record.currency,
      original: record.unitPrice,
      date: record.effectiveDate,
      unit: record.measurementUnit,
    })).filter((entry) => entry.price !== null).sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  }, [filteredRecords, itemFilter]);

  const comparableRecords = filteredRecords.filter((record) => getPriceInBdt(record) !== null && compatible(record, record.itemId));
  const comparablePrices = comparableRecords.map((record) => getPriceInBdt(record)!).filter(Number.isFinite);
  const average = itemFilter !== "all" && comparablePrices.length
    ? comparablePrices.reduce((sum, value) => sum + value, 0) / comparablePrices.length
    : null;
  const latestRecord = [...filteredRecords].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];

  const resetFilters = () => {
    setItemFilter("all");
    setCategoryFilter("all");
    setSupplierFilter("all");
    setUnitFilter("all");
    setSupplierType("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to dashboard" className="rounded-lg border border-line p-2 text-muted hover:bg-canvas"><ArrowLeft size={17} /></Link>
          <div><p className="text-sm font-bold">Analytics & reports</p><p className="mt-0.5 text-[11px] text-muted">Trends based on recorded price history</p></div>
        </div>
        <span className="rounded-full bg-[#fff3df] px-3 py-1.5 text-[10px] font-semibold text-[#96631a]">Demo data</span>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Procurement intelligence</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Analytics & reports</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Review recorded price trends, compare local and overseas suppliers, and filter the results by item, supplier, company unit, and date.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/price-records" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-semibold hover:bg-canvas"><FileSpreadsheet size={14} /> Price records</Link>
            <Link href="/price-comparison" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark"><BarChart3 size={14} /> Compare prices</Link>
          </div>
        </div>

        <section className="mb-5 rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold"><Filter size={16} className="text-brand" /> Report filters</div>
            <button type="button" onClick={resetFilters} className="text-xs font-semibold text-brand hover:underline">Reset filters</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField label="Item" value={itemFilter} onChange={setItemFilter}>
              <option value="all">All items</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
            </SelectField>
            <SelectField label="Category" value={categoryFilter} onChange={setCategoryFilter}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </SelectField>
            <SelectField label="Supplier" value={supplierFilter} onChange={setSupplierFilter}>
              <option value="all">All suppliers</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </SelectField>
            <SelectField label="Company unit" value={unitFilter} onChange={setUnitFilter}>
              <option value="all">All company units</option>
              {companyUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
            </SelectField>
            <SelectField label="Supplier type" value={supplierType} onChange={setSupplierType}>
              <option value="all">Local & overseas</option>
              <option value="local">Local only</option>
              <option value="overseas">Overseas only</option>
            </SelectField>
            <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">From date<span className="flex h-10 items-center gap-2 rounded-lg border border-line px-3"><CalendarDays size={14} className="text-muted" /><input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} className="min-w-0 flex-1 text-xs font-normal outline-none" /></span></label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">To date<span className="flex h-10 items-center gap-2 rounded-lg border border-line px-3"><CalendarDays size={14} className="text-muted" /><input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} className="min-w-0 flex-1 text-xs font-normal outline-none" /></span></label>
          </div>
          <p className="mt-4 text-[11px] text-muted">Only saved demo records are analysed. Prices without a valid BDT conversion or matching measurement unit are excluded from comparable-price metrics.</p>
        </section>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Filtered records" value={String(filteredRecords.length)} detail="Matching current filters" icon={<FileSpreadsheet size={17} />} />
          <MetricCard label="Comparable prices" value={String(comparableRecords.length)} detail="Valid BDT conversion and unit" icon={<Package size={17} />} />
          <MetricCard label="Average comparable price" value={average === null ? "—" : money(average)} detail={itemFilter === "all" ? "Select one item for a meaningful average" : "Across matching records"} icon={<Wallet size={17} />} />
          <MetricCard label="Latest update" value={latestRecord ? dateLabel(latestRecord.effectiveDate) : "—"} detail="Most recent matching record" icon={<CalendarDays size={17} />} />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
            <div className="mb-5"><h2 className="text-sm font-bold">Recorded price trend</h2><p className="mt-1 text-xs text-muted">Monthly average for one selected item, converted to BDT</p></div>
            {itemFilter === "all" ? <EmptyChart message="Select one item to view a meaningful price trend." /> : trendData.length < 1 ? <EmptyChart /> : <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#edf0ed" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#89948e", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#89948e", fontSize: 11 }} width={66} />
                  <Tooltip formatter={(value) => typeof value === "number" ? money(value) : "No data"} contentStyle={{ border: "1px solid #e6ebe7", borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="average" name="All suppliers" stroke="#167a5a" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                  <Line type="monotone" dataKey="local" name="Local" stroke="#397bb8" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  <Line type="monotone" dataKey="overseas" name="Overseas" stroke="#b7791f" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>}
            <p className="mt-4 text-[10px] leading-5 text-muted">Months without comparable records are not filled or estimated. Each point is based only on recorded prices matching the current filters.</p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
            <div className="mb-5"><h2 className="text-sm font-bold">Latest comparable price by supplier</h2><p className="mt-1 text-xs text-muted">Latest matching record per supplier · BDT equivalent</p></div>
            {itemFilter === "all" ? <EmptyChart message="Select one item to compare supplier prices fairly." /> : supplierData.length < 1 ? <EmptyChart /> : <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierData.slice(0, 8)} layout="vertical" margin={{ top: 4, right: 14, left: 12, bottom: 4 }}>
                  <CartesianGrid stroke="#edf0ed" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#89948e", fontSize: 10 }} />
                  <YAxis type="category" dataKey="supplier" axisLine={false} tickLine={false} tick={{ fill: "#58635e", fontSize: 10 }} width={130} />
                  <Tooltip formatter={(value) => typeof value === "number" ? money(value) : "—"} labelStyle={{ fontSize: 11 }} contentStyle={{ border: "1px solid #e6ebe7", borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="price" name="Price (BDT)" fill="#167a5a" radius={[0, 5, 5, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>}
            <p className="mt-4 text-[10px] leading-5 text-muted">Only suppliers with comparable prices are ranked. The latest record dates may differ; check the table below before making a decision.</p>
          </section>
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
          <div className="flex flex-col gap-2 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><h2 className="text-sm font-bold">Filtered price records</h2><p className="mt-1 text-xs text-muted">{filteredRecords.length} record(s) match the current filters</p></div>
            <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-line px-3 text-xs font-semibold text-[#58635e] hover:bg-canvas"><Download size={14} /> Print / Save PDF</button>
          </div>
          {filteredRecords.length === 0 ? <div className="px-6 py-14 text-center text-sm text-muted">No price records match the selected filters.</div> : <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wider text-[#89948e]"><tr>{["Effective date", "Item", "Supplier", "Company unit", "Original price", "BDT equivalent", "Comparability"].map((heading) => <th key={heading} className="px-5 py-3.5">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">{[...filteredRecords].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate)).map((record) => {
                const item = items.find((entry) => entry.id === record.itemId);
                const supplier = suppliers.find((entry) => entry.id === record.supplierId);
                const unit = companyUnits.find((entry) => entry.id === record.companyUnitId);
                const bdt = getPriceInBdt(record);
                const unitMatches = compatible(record, record.itemId);
                return <tr key={record.id} className="hover:bg-[#fbfcfb]">
                  <td className="whitespace-nowrap px-5 py-4 text-xs">{dateLabel(record.effectiveDate)}</td>
                  <td className="px-5 py-4"><p className="text-xs font-semibold">{item?.name ?? "Unknown item"}</p><p className="mt-1 text-[10px] text-muted">{item?.code ?? record.itemId} · per {record.measurementUnit}</p></td>
                  <td className="px-5 py-4"><p className="text-xs font-medium">{supplier?.name ?? "Unknown supplier"}</p><p className="mt-1 text-[10px] text-muted">{supplier?.type === "local" ? "Local" : "Overseas"}</p></td>
                  <td className="px-5 py-4 text-xs">{unit?.name ?? "Unknown unit"}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold">{money(record.unitPrice, record.currency)} / {record.measurementUnit}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs">{bdt === null ? "—" : money(bdt)}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${bdt !== null && unitMatches ? "bg-brand-soft text-brand-dark" : "bg-[#fff0ee] text-[#a8483d]"}`}>{bdt === null ? "Rate unavailable" : !unitMatches ? "Unit mismatch" : "Comparable"}</span></td>
                </tr>;
              })}</tbody>
            </table>
          </div>}
          <div className="border-t border-line px-5 py-3 text-[10px] leading-5 text-muted sm:px-6">This report uses demo records only. Print / Save PDF uses the browser&apos;s print dialog; a downloadable Excel export is planned for the import/export milestone.</div>
        </section>
      </div>
    </main>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal outline-none focus:border-brand">{children}</select></label>;
}

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-xs text-muted">{icon}{label}</div><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-1 text-[11px] text-muted">{detail}</p></div>;
}

function EmptyChart({ message }: { message?: string }) {
  return <div className="flex h-[300px] flex-col items-center justify-center rounded-xl bg-canvas px-6 text-center"><BarChart3 size={26} className="text-muted" /><p className="mt-3 text-sm font-semibold">{message ? "Choose an item" : "Not enough comparable data"}</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted">{message ?? "Adjust the filters or add price records with compatible units and valid exchange rates."}</p></div>;
}
