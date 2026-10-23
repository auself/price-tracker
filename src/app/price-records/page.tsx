"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, CirclePlus, Clock3, Filter, History, Search, Wallet } from "lucide-react";
import { companyUnits, items, priceRecords as demoPriceRecords, suppliers } from "@/data/demo-data";
import type { CurrencyCode, PriceRecord } from "@/types";

const currencies: CurrencyCode[] = ["BDT", "USD", "EUR", "CNY", "INR"];
const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency, maximumFractionDigits: currency === "BDT" ? 2 : 4 }).format(value);

type PriceForm = {
  itemId: string;
  supplierId: string;
  companyUnitId: string;
  effectiveDate: string;
  unitPrice: string;
  currency: CurrencyCode;
  measurementUnit: string;
  exchangeRateToBdt: string;
  remarks: string;
};

const emptyForm = (): PriceForm => ({
  itemId: items.find((item) => item.active)?.id ?? "",
  supplierId: suppliers.find((supplier) => supplier.active)?.id ?? "",
  companyUnitId: companyUnits[0]?.id ?? "",
  effectiveDate: today(),
  unitPrice: "",
  currency: "BDT",
  measurementUnit: items.find((item) => item.active)?.unitOfMeasure ?? "kg",
  exchangeRateToBdt: "",
  remarks: "",
});

export default function PriceRecordsPage() {
  const [records, setRecords] = useState<PriceRecord[]>(demoPriceRecords.map((record) => ({ ...record })));
  const [form, setForm] = useState<PriceForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [itemFilter, setItemFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter((record) => itemFilter === "all" || record.itemId === itemFilter)
      .filter((record) => unitFilter === "all" || record.companyUnitId === unitFilter)
      .filter((record) => supplierFilter === "all" || record.supplierId === supplierFilter)
      .filter((record) => !fromDate || record.effectiveDate >= fromDate)
      .filter((record) => !toDate || record.effectiveDate <= toDate)
      .filter((record) => {
        const item = items.find((entry) => entry.id === record.itemId);
        const supplier = suppliers.find((entry) => entry.id === record.supplierId);
        return !q || item?.name.toLowerCase().includes(q) || item?.code.toLowerCase().includes(q) || supplier?.name.toLowerCase().includes(q);
      })
      .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate) || b.createdAt.localeCompare(a.createdAt));
  }, [records, search, itemFilter, unitFilter, supplierFilter, fromDate, toDate]);

  const setField = <K extends keyof PriceForm>(key: K, value: PriceForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const onItemChange = (itemId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    setForm((current) => ({ ...current, itemId, measurementUnit: item?.unitOfMeasure ?? current.measurementUnit }));
    setError("");
  };

  const saveRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setError("");
    const unitPrice = Number(form.unitPrice);
    const exchangeRate = form.currency === "BDT" ? undefined : Number(form.exchangeRateToBdt);
    if (!form.itemId || !form.supplierId || !form.companyUnitId || !form.effectiveDate || !form.measurementUnit.trim()) {
      setError("Complete all required fields before saving.");
      return;
    }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }
    if (form.currency !== "BDT" && (!Number.isFinite(exchangeRate) || !exchangeRate || exchangeRate <= 0)) {
      setError("Enter a valid BDT exchange rate for foreign-currency prices.");
      return;
    }
    const duplicate = records.some((record) =>
      record.itemId === form.itemId &&
      record.supplierId === form.supplierId &&
      record.companyUnitId === form.companyUnitId &&
      record.effectiveDate === form.effectiveDate
    );
    if (duplicate) {
      setError("A price record already exists for this item, supplier, company unit and effective date. Choose another date; existing history is not overwritten.");
      return;
    }
    const next: PriceRecord = {
      id: `price-${Date.now()}`,
      itemId: form.itemId,
      supplierId: form.supplierId,
      companyUnitId: form.companyUnitId,
      effectiveDate: form.effectiveDate,
      unitPrice,
      currency: form.currency,
      measurementUnit: form.measurementUnit.trim(),
      ...(exchangeRate ? { exchangeRateToBdt: exchangeRate } : {}),
      ...(form.remarks.trim() ? { remarks: form.remarks.trim() } : {}),
      createdAt: today(),
    };
    setRecords((current) => [next, ...current]);
    setForm(emptyForm());
    setShowForm(false);
    setNotice("Price record added to this demo session. Previous records were preserved.");
  };

  const activeItems = items.filter((item) => item.active);
  const activeSuppliers = suppliers.filter((supplier) => supplier.active);
  const latestDate = records.reduce((latest, record) => record.effectiveDate > latest ? record.effectiveDate : latest, "");
  const latestRecords = records.filter((record) => record.effectiveDate === latestDate).length;

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to dashboard" className="rounded-lg border border-line p-2 text-muted hover:bg-canvas"><ArrowLeft size={17} /></Link>
          <div><p className="text-sm font-bold">Price records</p><p className="mt-0.5 text-[11px] text-muted">Date-wise supplier pricing and history</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#fff3df] px-3 py-1.5 text-[10px] font-semibold text-[#96631a]"><span className="h-1.5 w-1.5 rounded-full bg-[#d69a2d]" /> Demo mode</div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-brand">Price management</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Price records & history</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Add a new dated price for an item, supplier and company unit. Each saved entry is a separate historical record.</p></div>
          <button onClick={() => { setShowForm((open) => !open); setError(""); setNotice(""); }} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark"><CirclePlus size={16} /> Add price record</button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-xs text-muted"><Wallet size={15} /> Total price records</div><p className="mt-3 text-2xl font-bold">{records.length}</p><p className="mt-1 text-[11px] text-muted">Demo session history</p></div>
          <div className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-xs text-muted"><CalendarDays size={15} /> Latest effective date</div><p className="mt-3 text-2xl font-bold">{latestDate || "—"}</p><p className="mt-1 text-[11px] text-muted">{latestRecords} record{latestRecords === 1 ? "" : "s"} on this date</p></div>
          <div className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-xs text-muted"><History size={15} /> Historical records retained</div><p className="mt-3 text-2xl font-bold">Yes</p><p className="mt-1 text-[11px] text-muted">New entries do not replace older dates</p></div>
        </div>

        {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-lg bg-brand-soft px-4 py-3 text-xs text-brand-dark"><Check size={15} className="mt-0.5 shrink-0" />{notice}</div>}

        {showForm && <form onSubmit={saveRecord} className="mb-6 rounded-2xl border border-brand/20 bg-white p-5 shadow-panel sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-bold">Add a price record</h2><p className="mt-1 text-xs text-muted">Required fields are marked with *.</p></div><span className="rounded-full bg-canvas px-3 py-1 text-[10px] text-muted">History-safe entry</span></div>
          {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Item *<select required value={form.itemId} onChange={(event) => onItemChange(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand">{activeItems.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Supplier *<select required value={form.supplierId} onChange={(event) => setField("supplierId", event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand">{activeSuppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name} ({supplier.type})</option>)}</select></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Company unit *<select required value={form.companyUnitId} onChange={(event) => setField("companyUnitId", event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand">{companyUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Effective date *<input required type="date" value={form.effectiveDate} onChange={(event) => setField("effectiveDate", event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand" /></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Unit price *<input required type="number" min="0.0001" step="any" value={form.unitPrice} onChange={(event) => setField("unitPrice", event.target.value)} placeholder="Enter supplier price" className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand" /></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Currency *<select value={form.currency} onChange={(event) => setField("currency", event.target.value as CurrencyCode)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand">{currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Measurement unit *<input required value={form.measurementUnit} onChange={(event) => setField("measurementUnit", event.target.value)} placeholder="kg, metre, yard, cone..." className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand" /></label>
            {form.currency !== "BDT" && <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Exchange rate to BDT *<input required type="number" min="0.000001" step="any" value={form.exchangeRateToBdt} onChange={(event) => setField("exchangeRateToBdt", event.target.value)} placeholder="BDT per 1 unit of currency" className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand" /><span className="text-[10px] font-normal text-muted">Stored with this record; later rates will not rewrite this history.</span></label>}
            <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55] sm:col-span-2 lg:col-span-3">Remarks<textarea rows={2} value={form.remarks} onChange={(event) => setField("remarks", event.target.value)} placeholder="Optional note, quotation reference or context" className="rounded-lg border border-line bg-white px-3 py-2 text-xs outline-none focus:border-brand" /></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2"><button type="submit" className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark"><Check size={15} /> Save price record</button><button type="button" onClick={() => { setShowForm(false); setError(""); }} className="h-10 rounded-lg border border-line px-4 text-xs font-semibold text-muted hover:bg-canvas">Cancel</button></div>
        </form>}

        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
          <div className="border-b border-line p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-bold">Price history</h2><p className="mt-1 text-xs text-muted">{filteredRecords.length} matching record{filteredRecords.length === 1 ? "" : "s"}</p></div><label className="flex h-10 items-center gap-2 rounded-lg border border-line px-3 sm:w-64"><Search size={15} className="text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search item or supplier" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="grid gap-1 text-[10px] font-semibold text-muted">ITEM<select value={itemFilter} onChange={(event) => setItemFilter(event.target.value)} className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-normal text-ink"><option value="all">All items</option>{items.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label>
              <label className="grid gap-1 text-[10px] font-semibold text-muted">SUPPLIER<select value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)} className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-normal text-ink"><option value="all">All suppliers</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
              <label className="grid gap-1 text-[10px] font-semibold text-muted">COMPANY UNIT<select value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)} className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-normal text-ink"><option value="all">All units</option>{companyUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
              <label className="grid gap-1 text-[10px] font-semibold text-muted">FROM DATE<input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-normal text-ink" /></label>
              <label className="grid gap-1 text-[10px] font-semibold text-muted">TO DATE<input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-normal text-ink" /></label>
            </div>
          </div>
          {filteredRecords.length === 0 ? <div className="px-6 py-16 text-center"><Filter size={25} className="mx-auto text-muted" /><p className="mt-3 text-sm font-semibold">No price records found</p><p className="mt-1 text-xs text-muted">Adjust the filters or add a new price record.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse text-left"><thead className="bg-canvas text-[10px] uppercase tracking-wider text-muted"><tr>{["Effective date", "Item", "Supplier", "Company unit", "Unit price", "Currency", "Measure", "BDT equivalent", "Remarks"].map((heading) => <th key={heading} className="px-4 py-3 font-semibold first:pl-6">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{filteredRecords.map((record) => {
            const item = items.find((entry) => entry.id === record.itemId);
            const supplier = suppliers.find((entry) => entry.id === record.supplierId);
            const unit = companyUnits.find((entry) => entry.id === record.companyUnitId);
            const bdt = record.currency === "BDT" ? record.unitPrice : record.exchangeRateToBdt ? record.unitPrice * record.exchangeRateToBdt : null;
            return <tr key={record.id} className="hover:bg-[#fbfcfb]"><td className="whitespace-nowrap px-4 py-4 pl-6 text-xs font-medium"><span className="flex items-center gap-2"><Clock3 size={14} className="text-muted" />{record.effectiveDate}</span></td><td className="px-4 py-4"><p className="text-xs font-semibold">{item?.name ?? "Unknown item"}</p><p className="mt-1 text-[10px] text-muted">{item?.code} · {item?.specification}</p></td><td className="px-4 py-4"><p className="text-xs font-medium">{supplier?.name ?? "Unknown supplier"}</p><p className="mt-1 text-[10px] text-muted">{supplier?.type === "overseas" ? "Overseas" : "Local"}{supplier?.country ? ` · ${supplier.country}` : ""}</p></td><td className="px-4 py-4 text-xs">{unit?.name ?? "Unknown unit"}</td><td className="px-4 py-4 text-xs font-bold tabular-nums">{money(record.unitPrice, record.currency)}</td><td className="px-4 py-4"><span className="rounded-md bg-canvas px-2 py-1 text-[10px] font-semibold">{record.currency}</span></td><td className="px-4 py-4 text-xs">{record.measurementUnit}</td><td className="px-4 py-4 text-xs tabular-nums">{bdt === null ? <span className="text-muted">Not available</span> : money(bdt, "BDT")}</td><td className="max-w-[220px] truncate px-4 py-4 text-xs text-muted" title={record.remarks ?? ""}>{record.remarks || "—"}</td></tr>;
          })}</tbody></table></div>}
          <div className="border-t border-line px-5 py-3 text-[10px] text-muted sm:px-6">Demo mode: new records remain in React state only and reset on refresh. Database persistence and server-side permissions are not connected.</div>
        </section>
      </div>
    </main>
  );
}
