"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Check, ChevronDown, CirclePlus, Edit2, Layers3, Package, Search, Tags, Truck, X } from "lucide-react";
import { categories as initialCategories, companyUnits as initialUnits, items as initialItems, suppliers as initialSuppliers } from "@/data/demo-data";
import type { CompanyUnit, Item, ItemCategory, Supplier, SupplierType, CurrencyCode } from "@/types";

type Section = "Items" | "Categories" | "Suppliers" | "Company units";
type MasterRecord = Item | ItemCategory | Supplier | CompanyUnit;

const sections: { label: Section; icon: typeof Package; description: string }[] = [
  { label: "Items", icon: Package, description: "Maintain item codes, specifications and measurement units." },
  { label: "Categories", icon: Tags, description: "Organise items into consistent purchasing categories." },
  { label: "Suppliers", icon: Truck, description: "Maintain local and overseas supplier details." },
  { label: "Company units", icon: Building2, description: "Compare purchasing information across sister units." },
];

export default function MasterDataPage() {
  const [section, setSection] = useState<Section>("Items");
  const [items, setItems] = useState<Item[]>(initialItems.map((x) => ({ ...x })));
  const [categories, setCategories] = useState<ItemCategory[]>(initialCategories.map((x) => ({ ...x })));
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers.map((x) => ({ ...x })));
  const [units, setUnits] = useState<CompanyUnit[]>(initialUnits.map((x) => ({ ...x })));
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});

  const allRecords: MasterRecord[] = section === "Items" ? items : section === "Categories" ? categories : section === "Suppliers" ? suppliers : units;
  const filtered = useMemo(() => allRecords.filter((record) => JSON.stringify(record).toLowerCase().includes(query.toLowerCase())), [allRecords, query]);

  const resetForm = () => { setForm({}); setEditingId(null); setShowForm(false); };
  const startCreate = () => {
    setForm(section === "Items" ? { code: "", name: "", categoryId: categories[0]?.id ?? "", unitOfMeasure: "kg", specification: "", active: "true" }
      : section === "Categories" ? { name: "" }
      : section === "Suppliers" ? { code: "", name: "", type: "local", country: "Bangladesh", defaultCurrency: "BDT", active: "true" }
      : { code: "", name: "" });
    setEditingId(null); setShowForm(true); setNotice("");
  };
  const startEdit = (record: MasterRecord) => {
    const values: Record<string, string> = {};
    Object.entries(record).forEach(([key, value]) => { values[key] = String(value); });
    setForm(values); setEditingId(record.id); setShowForm(true); setNotice("");
  };
  const saveRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = editingId ?? `${section.toLowerCase().replaceAll(" ", "-")}-${Date.now()}`;
    if (section === "Items") {
      const next: Item = { id, code: form.code.trim(), name: form.name.trim(), categoryId: form.categoryId, unitOfMeasure: form.unitOfMeasure.trim(), specification: form.specification.trim(), active: form.active === "true" };
      if (!next.code || !next.name || !next.categoryId || !next.unitOfMeasure) { setNotice("Complete all required fields."); return; }
      if (items.some((x) => x.code.toLowerCase() === next.code.toLowerCase() && x.id !== editingId)) { setNotice("An item with this code already exists."); return; }
      setItems((old) => editingId ? old.map((x) => x.id === id ? next : x) : [next, ...old]);
    } else if (section === "Categories") {
      const next: ItemCategory = { id, name: form.name.trim() };
      if (!next.name) { setNotice("Enter a category name."); return; }
      if (categories.some((x) => x.name.toLowerCase() === next.name.toLowerCase() && x.id !== editingId)) { setNotice("This category already exists."); return; }
      setCategories((old) => editingId ? old.map((x) => x.id === id ? next : x) : [next, ...old]);
    } else if (section === "Suppliers") {
      const next: Supplier = { id, code: form.code.trim(), name: form.name.trim(), type: form.type as SupplierType, country: form.country.trim(), defaultCurrency: form.defaultCurrency as CurrencyCode, active: form.active === "true" };
      if (!next.code || !next.name || !next.country) { setNotice("Complete all required fields."); return; }
      if (suppliers.some((x) => x.code.toLowerCase() === next.code.toLowerCase() && x.id !== editingId)) { setNotice("A supplier with this code already exists."); return; }
      setSuppliers((old) => editingId ? old.map((x) => x.id === id ? next : x) : [next, ...old]);
    } else {
      const next: CompanyUnit = { id, code: form.code.trim(), name: form.name.trim() };
      if (!next.code || !next.name) { setNotice("Complete all required fields."); return; }
      if (units.some((x) => x.code.toLowerCase() === next.code.toLowerCase() && x.id !== editingId)) { setNotice("A company unit with this code already exists."); return; }
      setUnits((old) => editingId ? old.map((x) => x.id === id ? next : x) : [next, ...old]);
    }
    setNotice(editingId ? "Record updated in this demo session." : "Record added in this demo session.");
    resetForm();
  };
  const toggleActive = (id: string) => {
    if (section === "Items") setItems((old) => old.map((x) => x.id === id ? { ...x, active: !x.active } : x));
    if (section === "Suppliers") setSuppliers((old) => old.map((x) => x.id === id ? { ...x, active: !x.active } : x));
    setNotice("Status changed in this demo session. No database is connected.");
  };

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3"><Link href="/" aria-label="Back to dashboard" className="rounded-lg border border-line p-2 text-muted hover:bg-canvas"><ArrowLeft size={17} /></Link><div><p className="text-sm font-bold">Master data</p><p className="mt-0.5 text-[11px] text-muted">Items, suppliers, categories and company units</p></div></div>
        <div className="flex items-center gap-2 rounded-full bg-[#fff3df] px-3 py-1.5 text-[10px] font-semibold text-[#96631a]"><span className="h-1.5 w-1.5 rounded-full bg-[#d69a2d]" /> Demo mode</div>
      </header>
      <div className="mx-auto max-w-[1450px] px-4 py-7 sm:px-8">
        <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-widest text-brand">Configuration</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Master data management</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Keep purchasing reference data consistent across company units. Changes here are held in browser memory only until database integration is implemented.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sections.map(({ label, icon: Icon, description }) => <button key={label} onClick={() => { setSection(label); resetForm(); setNotice(""); }} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-panel ${section === label ? "border-brand bg-brand-soft/50" : "border-line bg-white"}`}><div className="flex items-center justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${section === label ? "bg-brand text-white" : "bg-canvas text-muted"}`}><Icon size={19} /></span><span className="text-lg font-bold">{label === "Items" ? items.length : label === "Categories" ? categories.length : label === "Suppliers" ? suppliers.length : units.length}</span></div><h2 className="mt-4 text-sm font-bold">{label}</h2><p className="mt-1 text-xs leading-5 text-muted">{description}</p></button>)}
        </div>
        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
          <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-base font-bold">{section}</h2><p className="mt-1 text-xs text-muted">{filtered.length} record{filtered.length === 1 ? "" : "s"} · manage reference information</p></div><div className="flex flex-wrap gap-2"><label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-line px-3 sm:flex-none"><Search size={15} className="text-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${section.toLowerCase()}...`} className="w-full bg-transparent text-xs outline-none" /></label><button onClick={startCreate} className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark"><CirclePlus size={15} /> Add {section === "Items" ? "item" : section === "Categories" ? "category" : section === "Suppliers" ? "supplier" : "unit"}</button></div></div>
          {notice && <div role="status" className="mx-5 mt-4 flex items-start gap-2 rounded-lg bg-brand-soft px-3 py-2.5 text-xs text-brand-dark sm:mx-6"><Check size={15} className="mt-0.5 shrink-0" />{notice}</div>}
          {showForm && <form onSubmit={saveRecord} className="m-5 rounded-xl border border-brand/20 bg-[#fbfdfb] p-4 sm:m-6 sm:p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-bold">{editingId ? "Edit" : "Add"} {section.slice(0, -1).toLowerCase() === "compan" ? "company unit" : section === "Company units" ? "company unit" : section.slice(0, -1).toLowerCase()}</h3><button type="button" aria-label="Close form" onClick={resetForm} className="rounded-lg p-1.5 text-muted hover:bg-white"><X size={17} /></button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section !== "Categories" && <Field label="Code *" value={form.code ?? ""} onChange={(v) => setForm((old) => ({ ...old, code: v }))} required placeholder="Unique code" />}
            <Field label={section === "Categories" ? "Category name *" : "Name *"} value={form.name ?? ""} onChange={(v) => setForm((old) => ({ ...old, name: v }))} required placeholder="Enter name" />
            {section === "Items" && <><label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Category *<select required value={form.categoryId ?? ""} onChange={(e) => setForm((old) => ({ ...old, categoryId: e.target.value }))} className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Field label="Measurement unit *" value={form.unitOfMeasure ?? ""} onChange={(v) => setForm((old) => ({ ...old, unitOfMeasure: v }))} required placeholder="kg, meter, cone..." /><Field label="Specification" value={form.specification ?? ""} onChange={(v) => setForm((old) => ({ ...old, specification: v }))} placeholder="Grade, GSM, size..." /></>}
            {section === "Suppliers" && <><label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Supplier type<select value={form.type ?? "local"} onChange={(e) => setForm((old) => ({ ...old, type: e.target.value }))} className="h-10 rounded-lg border border-line bg-white px-3 text-xs"><option value="local">Local</option><option value="overseas">Overseas</option></select></label><Field label="Country *" value={form.country ?? ""} onChange={(v) => setForm((old) => ({ ...old, country: v }))} required placeholder="Country" /><label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Default currency<select value={form.defaultCurrency ?? "BDT"} onChange={(e) => setForm((old) => ({ ...old, defaultCurrency: e.target.value }))} className="h-10 rounded-lg border border-line bg-white px-3 text-xs">{(["BDT", "USD", "EUR", "CNY", "INR"] as CurrencyCode[]).map((c) => <option key={c}>{c}</option>)}</select></label></>}
            {(section === "Items" || section === "Suppliers") && <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">Status<select value={form.active ?? "true"} onChange={(e) => setForm((old) => ({ ...old, active: e.target.value }))} className="h-10 rounded-lg border border-line bg-white px-3 text-xs"><option value="true">Active</option><option value="false">Inactive</option></select></label>}
          </div><div className="mt-5 flex flex-wrap gap-2"><button type="submit" className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark"><Check size={15} /> Save record</button><button type="button" onClick={resetForm} className="h-10 rounded-lg border border-line px-4 text-xs font-semibold text-muted hover:bg-white">Cancel</button></div></form>}
          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wider text-[#89948e]"><tr>{(section === "Items" ? ["Item", "Category", "Unit", "Specification", "Status", ""] : section === "Categories" ? ["Category", "Items linked", ""] : section === "Suppliers" ? ["Supplier", "Type", "Country", "Currency", "Status", ""] : ["Company unit", "Code", "Usage", ""]).map((heading) => <th key={heading} className="px-5 py-3.5">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{filtered.map((record) => {
            if (section === "Items") { const x = record as Item; return <tr key={x.id} className="hover:bg-[#fbfcfb]"><td className="px-5 py-4"><p className="text-xs font-semibold">{x.name}</p><p className="mt-1 text-[10px] text-muted">{x.code}</p></td><td className="px-5 py-4 text-xs">{categories.find((c) => c.id === x.categoryId)?.name ?? "Unassigned"}</td><td className="px-5 py-4 text-xs">{x.unitOfMeasure}</td><td className="max-w-[220px] px-5 py-4 text-xs text-muted">{x.specification || "—"}</td><td className="px-5 py-4"><Status active={x.active} /></td><td className="px-5 py-4"><RowActions onEdit={() => startEdit(x)} onToggle={() => toggleActive(x.id)} active={x.active} /></td></tr>; }
            if (section === "Categories") { const x = record as ItemCategory; return <tr key={x.id} className="hover:bg-[#fbfcfb]"><td className="px-5 py-4 text-xs font-semibold">{x.name}</td><td className="px-5 py-4 text-xs text-muted">{items.filter((item) => item.categoryId === x.id).length} items</td><td className="px-5 py-4"><button onClick={() => startEdit(x)} className="rounded-lg border border-line p-2 text-muted hover:bg-canvas" aria-label={`Edit ${x.name}`}><Edit2 size={14} /></button></td></tr>; }
            if (section === "Suppliers") { const x = record as Supplier; return <tr key={x.id} className="hover:bg-[#fbfcfb]"><td className="px-5 py-4"><p className="text-xs font-semibold">{x.name}</p><p className="mt-1 text-[10px] text-muted">{x.code}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${x.type === "local" ? "bg-brand-soft text-brand-dark" : "bg-[#eaf2fc] text-[#326ca8]"}`}>{x.type === "local" ? "Local" : "Overseas"}</span></td><td className="px-5 py-4 text-xs">{x.country}</td><td className="px-5 py-4 text-xs">{x.defaultCurrency}</td><td className="px-5 py-4"><Status active={x.active} /></td><td className="px-5 py-4"><RowActions onEdit={() => startEdit(x)} onToggle={() => toggleActive(x.id)} active={x.active} /></td></tr>; }
            const x = record as CompanyUnit; return <tr key={x.id} className="hover:bg-[#fbfcfb]"><td className="px-5 py-4 text-xs font-semibold">{x.name}</td><td className="px-5 py-4 text-xs text-muted">{x.code}</td><td className="px-5 py-4 text-xs text-muted">Shared workspace</td><td className="px-5 py-4"><button onClick={() => startEdit(x)} className="rounded-lg border border-line p-2 text-muted hover:bg-canvas" aria-label={`Edit ${x.name}`}><Edit2 size={14} /></button></td></tr>;
          })}</tbody></table></div>
          {filtered.length === 0 && <div className="px-6 py-14 text-center"><Layers3 className="mx-auto text-[#a4aea8]" size={26} /><p className="mt-3 text-sm font-semibold">No records found</p><p className="mt-1 text-xs text-muted">Try another search or add a new record.</p></div>}
          <div className="flex flex-col gap-1 border-t border-line px-5 py-4 text-[10px] text-muted sm:flex-row sm:justify-between sm:px-6"><span>Showing {filtered.length} of {allRecords.length} {section.toLowerCase()}</span><span>Demo changes reset when you refresh the page.</span></div>
        </section>
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f0dfbb] bg-[#fffaf0] p-4 text-xs leading-5 text-[#86621d]"><ChevronDown size={16} className="mt-0.5 shrink-0 rotate-[-90deg]" /><p><strong>Before production:</strong> changes are not yet saved to a database and are not shared with other users. Database persistence, authentication and server-side permissions will be added in later modules.</p></div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) {
  return <label className="grid gap-1.5 text-xs font-medium text-[#4e5b55]">{label}<input value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none focus:border-brand" /></label>;
}
function Status({ active }: { active: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${active ? "bg-brand-soft text-brand-dark" : "bg-[#f1f2f1] text-muted"}`}>{active ? "Active" : "Inactive"}</span>;
}
function RowActions({ onEdit, onToggle, active }: { onEdit: () => void; onToggle: () => void; active: boolean }) {
  return <div className="flex items-center gap-1.5"><button onClick={onEdit} className="rounded-lg border border-line p-2 text-muted hover:bg-canvas" aria-label="Edit record"><Edit2 size={14} /></button>{onToggle && <button onClick={onToggle} className="rounded-lg border border-line px-2.5 py-2 text-[10px] font-medium text-muted hover:bg-canvas">{active ? "Deactivate" : "Activate"}</button>}</div>;
}
