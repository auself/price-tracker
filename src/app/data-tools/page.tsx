"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, CircleAlert, Download, FileSpreadsheet, FileUp, MessageSquareText,
  RefreshCw, Send, ShieldCheck, Upload, X,
} from "lucide-react";
import { companyUnits, items, priceRecords, suppliers } from "@/data/demo-data";
import type { CurrencyCode, PriceRecord } from "@/types";

type ImportRow = {
  rowNumber: number;
  itemCode: string;
  supplierCode: string;
  companyUnitCode: string;
  effectiveDate: string;
  unitPrice: number;
  currency: CurrencyCode;
  measurementUnit: string;
  exchangeRateToBdt?: number;
  remarks?: string;
  error?: string;
  duplicate?: boolean;
};

type Suggestion = {
  id: string;
  itemId: string;
  effectiveDate: string;
  details: string;
  reason: string;
  status: "Pending" | "Accepted" | "Rejected";
  response?: string;
  submittedAt: string;
};

const requiredColumns = [
  "itemCode", "supplierCode", "companyUnitCode", "effectiveDate", "unitPrice",
  "currency", "measurementUnit", "exchangeRateToBdt", "remarks",
];

const currencies: CurrencyCode[] = ["BDT", "USD", "EUR", "CNY", "INR"];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function dateToday() {
  return new Date().toISOString().slice(0, 10);
}

function getRecordKey(record: Pick<PriceRecord, "itemId" | "supplierId" | "companyUnitId" | "effectiveDate">) {
  return [record.itemId, record.supplierId, record.companyUnitId, record.effectiveDate].join("|");
}

export default function DataToolsPage() {
  const [activeTab, setActiveTab] = useState<"import" | "suggestions">("import");
  const [previewRows, setPreviewRows] = useState<ImportRow[]>([]);
  const [importName, setImportName] = useState("");
  const [importNotice, setImportNotice] = useState("");
  const [importError, setImportError] = useState("");
  const [records, setRecords] = useState<PriceRecord[]>(() => priceRecords.map((record) => ({ ...record })));
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [itemId, setItemId] = useState(items.find((item) => item.active)?.id ?? "");
  const [effectiveDate, setEffectiveDate] = useState(dateToday());
  const [details, setDetails] = useState("");
  const [reason, setReason] = useState("");
  const [suggestionNotice, setSuggestionNotice] = useState("");
  const [suggestionError, setSuggestionError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.location.hash === "#suggestions") setActiveTab("suggestions");
  }, []);

  const previewSummary = useMemo(() => ({
    total: previewRows.length,
    accepted: previewRows.filter((row) => !row.error && !row.duplicate).length,
    errors: previewRows.filter((row) => Boolean(row.error)).length,
    duplicates: previewRows.filter((row) => Boolean(row.duplicate)).length,
  }), [previewRows]);

  const exportRecords = () => {
    const rows = records.map((record) => {
      const item = items.find((entry) => entry.id === record.itemId);
      const supplier = suppliers.find((entry) => entry.id === record.supplierId);
      const unit = companyUnits.find((entry) => entry.id === record.companyUnitId);
      return [
        record.effectiveDate, item?.code ?? record.itemId, item?.name ?? "",
        supplier?.code ?? record.supplierId, supplier?.name ?? "",
        unit?.code ?? record.companyUnitId, unit?.name ?? "",
        record.unitPrice, record.currency, record.measurementUnit,
        record.exchangeRateToBdt ?? "", record.remarks ?? "",
      ];
    });
    downloadCsv("price-tracker-records.csv", [[
      "effectiveDate", "itemCode", "itemName", "supplierCode", "supplierName",
      "companyUnitCode", "companyUnitName", "unitPrice", "currency",
      "measurementUnit", "exchangeRateToBdt", "remarks",
    ], ...rows]);
    setImportNotice("Export prepared. The CSV file can be opened in Excel.");
    setImportError("");
  };

  const downloadTemplate = () => {
    downloadCsv("price-tracker-import-template.csv", [
      requiredColumns,
      ["FAB-001", "SUP-001", "UNIT-001", dateToday(), "100", "BDT", "kg", "", "Example only - replace with actual data"],
    ]);
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPreviewRows([]);
    setImportNotice("");
    setImportError("");
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportError("Please select a CSV file. Open an Excel workbook and save it as CSV UTF-8 before importing.");
      event.target.value = "";
      return;
    }
    setImportName(file.name);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setImportError("The file must include a header row and at least one data row.");
        return;
      }
      const headers = parsed[0].map((header) => header.trim());
      const missing = requiredColumns.filter((column) => !headers.includes(column));
      if (missing.length) {
        setImportError("Missing required columns: " + missing.join(", ") + ". Download the template to see the expected format.");
        return;
      }
      const existingKeys = new Set(records.map(getRecordKey));
      const incomingKeys = new Set<string>();
      const rows = parsed.slice(1).map((cells, index): ImportRow => {
        const get = (name: string) => (cells[headers.indexOf(name)] ?? "").trim();
        const itemCode = get("itemCode");
        const supplierCode = get("supplierCode");
        const companyUnitCode = get("companyUnitCode");
        const effectiveDate = get("effectiveDate");
        const parsedDate = new Date(effectiveDate + "T00:00:00.000Z");
        const validDate = /^\\d{4}-\\d{2}-\\d{2}$/.test(effectiveDate) && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === effectiveDate;
        const rawPrice = get("unitPrice");
        const rawCurrency = get("currency").toUpperCase();
        const measurementUnit = get("measurementUnit");
        const rawRate = get("exchangeRateToBdt");
        const item = items.find((entry) => entry.code.toLowerCase() === itemCode.toLowerCase());
        const supplier = suppliers.find((entry) => entry.code.toLowerCase() === supplierCode.toLowerCase());
        const unit = companyUnits.find((entry) => entry.code.toLowerCase() === companyUnitCode.toLowerCase());
        const price = Number(rawPrice);
        const rate = rawRate ? Number(rawRate) : undefined;
        let error = "";
        if (!item) error = "Unknown item code: " + itemCode;
        else if (!supplier) error = "Unknown supplier code: " + supplierCode;
        else if (!unit) error = "Unknown company unit code: " + companyUnitCode;
        else if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate) || Number.isNaN(Date.parse(effectiveDate))) error = "Date must use YYYY-MM-DD.";
        else if (!rawPrice || !Number.isFinite(price) || price <= 0) error = "Unit price must be a number greater than zero.";
        else if (!currencies.includes(rawCurrency as CurrencyCode)) error = "Unsupported currency: " + rawCurrency;
        else if (!measurementUnit) error = "Measurement unit is required.";
        else if (rawCurrency !== "BDT" && (!rate || !Number.isFinite(rate) || rate <= 0)) error = "Foreign-currency prices need a valid BDT exchange rate.";
        const recordKey = item && supplier && unit ? getRecordKey({ itemId: item.id, supplierId: supplier.id, companyUnitId: unit.id, effectiveDate }) : "";
        const duplicate = !error && (existingKeys.has(recordKey) || incomingKeys.has(recordKey));
        if (!error && recordKey) incomingKeys.add(recordKey);
        return {
          rowNumber: index + 2, itemCode, supplierCode, companyUnitCode, effectiveDate,
          unitPrice: price, currency: rawCurrency as CurrencyCode, measurementUnit,
          ...(rate ? { exchangeRateToBdt: rate } : {}),
          ...(get("remarks") ? { remarks: get("remarks") } : {}),
          ...(error ? { error } : {}),
          ...(duplicate ? { duplicate: true } : {}),
        };
      });
      setPreviewRows(rows);
      if (rows.length === 0) setImportError("No data rows were found in the selected file.");
    } catch {
      setImportError("Could not read this file. Check that it is a valid UTF-8 CSV file.");
    }
  };

  const confirmImport = () => {
    const validRows = previewRows.filter((row) => !row.error && !row.duplicate);
    if (!validRows.length) {
      setImportError("There are no valid new rows to import.");
      return;
    }
    const added: PriceRecord[] = validRows.flatMap((row) => {
      const item = items.find((entry) => entry.code.toLowerCase() === row.itemCode.toLowerCase());
      const supplier = suppliers.find((entry) => entry.code.toLowerCase() === row.supplierCode.toLowerCase());
      const unit = companyUnits.find((entry) => entry.code.toLowerCase() === row.companyUnitCode.toLowerCase());
      if (!item || !supplier || !unit) return [];
      return [{
        id: "import-" + row.rowNumber + "-" + Date.now(),
        itemId: item.id,
        supplierId: supplier.id,
        companyUnitId: unit.id,
        effectiveDate: row.effectiveDate,
        unitPrice: row.unitPrice,
        currency: row.currency,
        measurementUnit: row.measurementUnit,
        ...(row.exchangeRateToBdt ? { exchangeRateToBdt: row.exchangeRateToBdt } : {}),
        ...(row.remarks ? { remarks: row.remarks } : {}),
        createdAt: dateToday(),
      }];
    });
    setRecords((current) => [...added, ...current]);
    setImportNotice(added.length + " record(s) imported into this demo session. They reset on refresh and are not saved to a database.");
    setImportError("");
    setPreviewRows([]);
    setImportName("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const submitSuggestion = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuggestionError("");
    setSuggestionNotice("");
    if (!itemId || !details.trim() || !reason.trim()) {
      setSuggestionError("Select an item and enter both the suggestion and reason.");
      return;
    }
    const suggestion: Suggestion = {
      id: "suggestion-" + Date.now(),
      itemId,
      effectiveDate,
      details: details.trim(),
      reason: reason.trim(),
      status: "Pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setSuggestions((current) => [suggestion, ...current]);
    setDetails("");
    setReason("");
    setSuggestionNotice("Suggestion submitted for review in this demo session. Official price records were not changed.");
  };

  const updateSuggestion = (id: string, status: "Accepted" | "Rejected") => {
    setSuggestions((current) => current.map((suggestion) =>
      suggestion.id === id ? { ...suggestion, status, response: status === "Accepted" ? "Marked accepted in demo review." : "Marked rejected in demo review." } : suggestion
    ));
  };

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to dashboard" className="rounded-lg border border-line p-2 text-muted hover:bg-canvas"><ArrowLeft size={17} /></Link>
          <div><p className="text-sm font-bold">Data tools & suggestions</p><p className="mt-0.5 text-[11px] text-muted">CSV workflows and correction review</p></div>
        </div>
        <span className="rounded-full bg-[#fff3df] px-3 py-1.5 text-[10px] font-semibold text-[#96631a]">Demo mode</span>
      </header>

      <div className="mx-auto max-w-[1450px] px-4 py-7 sm:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-brand">Data management</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Import, export & suggestions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Export price history, validate a CSV before importing, and review suggested corrections without silently changing official records.</p></div>
          <Link href="/price-records" className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-line bg-white px-4 text-xs font-semibold hover:bg-canvas"><FileSpreadsheet size={15} /> Price records</Link>
        </div>

        <div className="mb-5 flex flex-wrap gap-2 border-b border-line">
          <button type="button" onClick={() => setActiveTab("import")} className={"border-b-2 px-4 py-3 text-xs font-semibold " + (activeTab === "import" ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink")}><FileSpreadsheet size={14} className="mr-2 inline" />Excel import / export</button>
          <button id="suggestions" type="button" onClick={() => setActiveTab("suggestions")} className={"border-b-2 px-4 py-3 text-xs font-semibold " + (activeTab === "suggestions" ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink")}><MessageSquareText size={14} className="mr-2 inline" />Suggestions & review</button>
        </div>

        {activeTab === "import" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
              <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><FileUp size={19} /></div><div><h2 className="text-base font-bold">Import price records</h2><p className="mt-1 text-xs leading-5 text-muted">Upload a CSV file exported from Excel. Rows are checked before import; existing or repeated item/supplier/unit/date combinations are skipped.</p></div></div>
              <div className="mt-5 rounded-xl border border-dashed border-line bg-canvas/50 p-5 text-center sm:p-8">
                <Upload size={24} className="mx-auto text-muted" />
                <p className="mt-3 text-sm font-semibold">Choose a CSV file</p>
                <p className="mt-1 text-xs text-muted">CSV UTF-8 · Required headers · Preview before confirmation</p>
                <input ref={fileInput} type="file" accept=".csv,text/csv" onChange={handleFile} className="mx-auto mt-4 block max-w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-dark" />
                {importName && <p className="mt-3 break-all text-xs font-medium text-brand">{importName}</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={downloadTemplate} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs font-semibold hover:bg-canvas"><Download size={14} /> Download template</button>
                <button type="button" onClick={exportRecords} className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"><Download size={14} /> Export records CSV</button>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-muted">Excel note: this milestone supports Excel-compatible CSV files, not native .xlsx workbooks. Imported records stay in this browser session only until the page is refreshed.</p>
              {importError && <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"><CircleAlert size={15} className="mt-0.5 shrink-0" />{importError}</div>}
              {importNotice && <div role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-brand-soft px-3 py-2.5 text-xs text-brand-dark"><Check size={15} className="mt-0.5 shrink-0" />{importNotice}</div>}
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
              <h2 className="text-base font-bold">Import rules</h2>
              <div className="mt-4 space-y-3">
                {[
                  ["Required identifiers", "Item, supplier and company unit must match existing codes."],
                  ["Valid prices", "Price must be greater than zero; foreign currency needs a BDT exchange rate."],
                  ["History safety", "Duplicate item + supplier + unit + date rows are skipped. Existing history is not overwritten."],
                  ["Review first", "Inspect row-level errors and duplicates before confirming import."],
                ].map(([title, description]) => <div key={title} className="flex gap-3 rounded-xl bg-canvas p-3"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" /><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] leading-5 text-muted">{description}</p></div></div>)}
              </div>
              <div className="mt-5 rounded-xl border border-[#f0d7a7] bg-[#fff8e9] p-4 text-xs leading-5 text-[#82591d]"><strong>Demo limitation:</strong> import/export and review are client-side prototypes. No database, server-side validation, or audit log is connected.</div>
            </section>

            {previewRows.length > 0 && <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel xl:col-span-2">
              <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div><h2 className="text-base font-bold">Import preview</h2><p className="mt-1 text-xs text-muted">Check the results before adding valid rows to this session.</p></div>
                <div className="flex flex-wrap gap-2 text-[11px]"><span className="rounded-full bg-canvas px-3 py-1.5">{previewSummary.total} rows</span><span className="rounded-full bg-brand-soft px-3 py-1.5 text-brand-dark">{previewSummary.accepted} ready</span><span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700">{previewSummary.errors} errors</span><span className="rounded-full bg-[#fff3df] px-3 py-1.5 text-[#96631a]">{previewSummary.duplicates} duplicates</span></div>
              </div>
              <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-canvas text-[10px] uppercase tracking-wider text-muted"><tr>{["Row", "Item code", "Supplier code", "Unit code", "Date", "Price", "Currency", "Result"].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-line">{previewRows.map((row) => <tr key={row.rowNumber} className="align-top"><td className="px-4 py-3 text-xs">{row.rowNumber}</td><td className="px-4 py-3 text-xs">{row.itemCode}</td><td className="px-4 py-3 text-xs">{row.supplierCode}</td><td className="px-4 py-3 text-xs">{row.companyUnitCode}</td><td className="px-4 py-3 text-xs">{row.effectiveDate}</td><td className="px-4 py-3 text-xs">{Number.isFinite(row.unitPrice) ? row.unitPrice : "—"}</td><td className="px-4 py-3 text-xs">{row.currency}</td><td className="max-w-[360px] px-4 py-3 text-xs">{row.error ? <span className="text-red-700">{row.error}</span> : row.duplicate ? <span className="text-[#96631a]">Duplicate: will be skipped</span> : <span className="font-semibold text-brand">Ready to import</span>}</td></tr>)}</tbody></table></div>
              <div className="flex flex-wrap gap-2 border-t border-line p-5 sm:px-6">
                <button type="button" onClick={confirmImport} disabled={previewSummary.accepted === 0} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"><Check size={15} /> Import {previewSummary.accepted} valid row(s)</button>
                <button type="button" onClick={() => { setPreviewRows([]); setImportName(""); setImportError(""); if (fileInput.current) fileInput.current.value = ""; }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-4 text-xs font-semibold hover:bg-canvas"><X size={15} /> Cancel preview</button>
              </div>
            </section>}
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
              <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2fc] text-[#397bb8]"><MessageSquareText size={19} /></div><div><h2 className="text-base font-bold">Suggest a correction</h2><p className="mt-1 text-xs leading-5 text-muted">Report a suspected error or recommend an update. Suggestions do not change official price records.</p></div></div>
              <form onSubmit={submitSuggestion} className="mt-5 space-y-4">
                <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">Affected item *<select required value={itemId} onChange={(event) => setItemId(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal outline-none focus:border-brand">{items.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label>
                <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">Related effective date<input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal outline-none focus:border-brand" /></label>
                <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">Suggested correction / issue *<textarea required rows={3} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Describe what should be checked or corrected" className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-normal outline-none focus:border-brand" /></label>
                <label className="grid gap-1.5 text-xs font-semibold text-[#4e5b55]">Reason / supporting details *<textarea required rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Add the reason, source or reference" className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-normal outline-none focus:border-brand" /></label>
                {suggestionError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{suggestionError}</p>}
                {suggestionNotice && <p role="status" className="rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand-dark">{suggestionNotice}</p>}
                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark"><Send size={14} /> Submit suggestion</button>
              </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
              <div className="flex items-center justify-between border-b border-line p-5 sm:px-6"><div><h2 className="text-base font-bold">Suggestion review</h2><p className="mt-1 text-xs text-muted">{suggestions.length} suggestion(s) in this session</p></div><button type="button" onClick={() => setSuggestions([])} disabled={suggestions.length === 0} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-[11px] font-semibold text-muted hover:bg-canvas disabled:opacity-40"><RefreshCw size={12} /> Clear demo list</button></div>
              {suggestions.length === 0 ? <div className="px-6 py-16 text-center"><MessageSquareText size={26} className="mx-auto text-muted" /><p className="mt-3 text-sm font-semibold">No suggestions submitted yet</p><p className="mt-1 text-xs text-muted">Submitted suggestions will appear here for this session.</p></div> : <div className="divide-y divide-line">{suggestions.map((suggestion) => {
                const item = items.find((entry) => entry.id === suggestion.itemId);
                return <article key={suggestion.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold">{item?.code} — {item?.name ?? "Unknown item"}</p><p className="mt-1 text-[10px] text-muted">Submitted {suggestion.submittedAt}{suggestion.effectiveDate ? " · Related date " + suggestion.effectiveDate : ""}</p></div><span className={"rounded-full px-2.5 py-1 text-[10px] font-semibold " + (suggestion.status === "Pending" ? "bg-[#fff3df] text-[#96631a]" : suggestion.status === "Accepted" ? "bg-brand-soft text-brand-dark" : "bg-red-50 text-red-700")}>{suggestion.status}</span></div><p className="mt-4 whitespace-pre-wrap text-xs leading-5">{suggestion.details}</p><p className="mt-2 whitespace-pre-wrap text-[11px] leading-5 text-muted">Reason: {suggestion.reason}</p>{suggestion.response && <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[11px] text-muted">{suggestion.response}</p>}{suggestion.status === "Pending" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => updateSuggestion(suggestion.id, "Accepted")} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-[11px] font-semibold text-white hover:bg-brand-dark"><Check size={13} /> Mark accepted</button><button type="button" onClick={() => updateSuggestion(suggestion.id, "Rejected")} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-[11px] font-semibold hover:bg-canvas"><X size={13} /> Mark rejected</button></div>}</article>;
              })}</div>}
              <div className="border-t border-line bg-canvas/60 px-5 py-3 text-[10px] leading-5 text-muted sm:px-6">Demo review only. Decisions are not persisted, and accepting a suggestion does not modify a price record.</div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
