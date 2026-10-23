"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight, ArrowUpRight, Bell, Boxes, Building2, CalendarDays,
  ChevronDown, CircleHelp, Download, FileSpreadsheet, Filter, LayoutDashboard,
  Menu, Package, Search, Settings2, ShieldCheck, Tags, TrendingDown,
  TrendingUp, Truck, Users, Wallet, X,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { categories, companyUnits, items, priceRecords, suppliers } from "@/data/demo-data";
import { getLatestPricePerSupplierAndUnit, getPriceInBdt } from "@/lib/price-calculations";

const navGroups = [
  { label: "WORKSPACE", links: [{ label: "Dashboard", icon: LayoutDashboard }, { label: "Price records", icon: Wallet }, { label: "Price comparison", icon: TrendingUp }, { label: "Price history", icon: CalendarDays }, { label: "Analytics & reports", icon: FileSpreadsheet }] },
  { label: "MASTER DATA", links: [{ label: "Items", icon: Package }, { label: "Categories", icon: Tags }, { label: "Suppliers", icon: Truck }, { label: "Company units", icon: Building2 }] },
  { label: "ADMINISTRATION", links: [{ label: "Suggestions", icon: Bell }, { label: "User management", icon: Users }, { label: "Settings", icon: Settings2 }] },
];

const trendData = [
  { month: "May", local: 398, overseas: 421 },
  { month: "Jun", local: 405, overseas: 416 },
  { month: "Jul", local: 401, overseas: 430 },
  { month: "Aug", local: 414, overseas: 425 },
  { month: "Sep", local: 410, overseas: 419 },
  { month: "Oct", local: 420, overseas: 415 },
];

const money = (value: number, currency = "BDT") =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency, maximumFractionDigits: currency === "BDT" ? 0 : 2 }).format(value);

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const recentRecords = useMemo(() => {
    return [...priceRecords]
      .filter((record) => unitFilter === "all" || record.companyUnitId === unitFilter)
      .filter((record) => {
        const item = items.find((entry) => entry.id === record.itemId);
        const supplier = suppliers.find((entry) => entry.id === record.supplierId);
        const search = query.toLowerCase();
        return !search || item?.name.toLowerCase().includes(search) || supplier?.name.toLowerCase().includes(search) || item?.code.toLowerCase().includes(search);
      })
      .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
      .slice(0, 6);
  }, [query, unitFilter]);

  const latestComparison = getLatestPricePerSupplierAndUnit(priceRecords, "item-001");
  const latestLocal = latestComparison.find((row) => row.currency === "BDT");
  const previousLocal = priceRecords.find((row) => row.id === "price-010");
  const localChange = latestLocal && previousLocal ? ((latestLocal.unitPrice - previousLocal.unitPrice) / previousLocal.unitPrice) * 100 : 0;
  const activeItems = items.filter((item) => item.active).length;
  const overseasCount = suppliers.filter((supplier) => supplier.type === "overseas" && supplier.active).length;
  const avgBdtPrice = priceRecords.map(getPriceInBdt).filter((price): price is number => price !== null);
  const average = avgBdtPrice.length ? avgBdtPrice.reduce((sum, price) => sum + price, 0) / avgBdtPrice.length : 0;

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {mobileNavOpen && <button aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-30 bg-ink/30 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-line bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-line px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"><Boxes size={21} /></div>
          <div><p className="text-[15px] font-bold tracking-tight">Price Tracker</p><p className="mt-0.5 text-[11px] text-muted">Procurement intelligence</p></div>
          <button aria-label="Close menu" onClick={() => setMobileNavOpen(false)} className="ml-auto rounded-lg p-1 text-muted hover:bg-canvas lg:hidden"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.13em] text-[#99a39e]">{group.label}</p>
              <nav className="space-y-1">
                {group.links.map(({ label, icon: Icon }) => {
                  const selected = activeNav === label;
                  const className = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${selected ? "bg-brand-soft font-semibold text-brand-dark" : "text-[#58635e] hover:bg-canvas hover:text-ink"}`;
                  if (label === "Price records") return <Link key={label} href="/price-records" onClick={() => { setActiveNav(label); setMobileNavOpen(false); }} className={className}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></Link>;
                  if (label === "Price comparison") return <Link key={label} href="/price-comparison" onClick={() => { setActiveNav(label); setMobileNavOpen(false); }} className={className}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></Link>;
                  if (group.label === "MASTER DATA") return <Link key={label} href="/master-data" onClick={() => setMobileNavOpen(false)} className={className}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></Link>;
                  return <button key={label} onClick={() => { setActiveNav(label); setMobileNavOpen(false); }} className={className}><Icon size={17} strokeWidth={selected ? 2.2 : 1.8} /><span>{label}</span>{label === "Suggestions" && <span className="ml-auto rounded-md bg-[#fff0d7] px-1.5 py-0.5 text-[10px] font-semibold text-[#986018]">3</span>}</button>;
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-xl bg-canvas p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcece4] text-xs font-bold text-brand-dark">AD</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">App Admin</p><p className="mt-0.5 text-[10px] text-muted">Demo workspace</p></div>
            <ChevronDown size={15} className="text-muted" />
          </div>
          <p className="mt-3 text-center text-[10px] text-[#9aa49e]">Prototype · Demo data only</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-7">
          <button aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 hover:bg-canvas lg:hidden"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-xs text-muted sm:flex"><span>Workspace</span><span>/</span><span className="font-semibold text-ink">{activeNav}</span></div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <label className="hidden h-10 w-56 items-center gap-2 rounded-lg border border-line bg-white px-3 md:flex"><Search size={16} className="text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items or suppliers" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#9aa49e]" /></label>
            <button aria-label="Help" className="hidden rounded-lg border border-line p-2 text-muted hover:bg-canvas sm:block"><CircleHelp size={17} /></button>
            <button aria-label="Notifications" className="relative rounded-lg border border-line p-2 text-muted hover:bg-canvas"><Bell size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e9a23b]" /></button>
            <div className="hidden h-8 w-px bg-line sm:block" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcece4] text-xs font-bold text-brand-dark">AU</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><div className="mb-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand" /><p className="text-xs font-semibold text-brand">OVERVIEW</p></div><h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">Price intelligence</h1><p className="mt-1.5 text-sm text-muted">Track supplier prices and spot changes across your company units.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs text-[#58635e]"><Building2 size={15} className="text-muted" /><select value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)} className="max-w-[150px] bg-transparent outline-none"><option value="all">All company units</option>{companyUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select><ChevronDown size={13} /></label>
              <button onClick={() => setActiveNav("Price records")} className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-dark"><Package size={15} /> Add price record</button>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Tracked items" value={String(activeItems)} detail="Across all categories" icon={<Package size={18} />} tone="green" trend="+2 this month" />
            <StatCard title="Active suppliers" value={String(suppliers.filter((supplier) => supplier.active).length)} detail={`${overseasCount} overseas suppliers`} icon={<Truck size={18} />} tone="blue" trend="Local & overseas" />
            <StatCard title="Price records" value={String(priceRecords.length)} detail="Historical records preserved" icon={<FileSpreadsheet size={18} />} tone="purple" trend="Date-wise history" />
            <StatCard title="Average recorded price" value={money(average)} detail="Converted to BDT where possible" icon={<Wallet size={18} />} tone="amber" trend="Demo calculation" />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-bold">Price movement</h2><p className="mt-1 text-xs text-muted">Illustrative average prices · May–October</p></div><button className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-[#58635e] hover:bg-canvas"><CalendarDays size={14} /> Last 6 months <ChevronDown size={13} /></button></div>
              <div className="mt-5 flex flex-wrap gap-4 text-xs"><span className="flex items-center gap-2 text-muted"><span className="h-2 w-2 rounded-full bg-brand" /> Local suppliers</span><span className="flex items-center gap-2 text-muted"><span className="h-2 w-2 rounded-full bg-[#8bb9e8]" /> Overseas suppliers (BDT)</span></div>
              <div className="mt-3 h-[245px] w-full">
                <ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 12, right: 5, left: -16, bottom: 0 }}><defs><linearGradient id="localFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#167a5a" stopOpacity={0.16} /><stop offset="100%" stopColor="#167a5a" stopOpacity={0} /></linearGradient><linearGradient id="overseasFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8bb9e8" stopOpacity={0.2} /><stop offset="100%" stopColor="#8bb9e8" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0ed" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#89948e", fontSize: 11 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#89948e", fontSize: 11 }} domain={["dataMin - 15", "dataMax + 15"]} /><Tooltip contentStyle={{ border: "1px solid #e6ebe7", borderRadius: 10, fontSize: 12 }} formatter={(value) => [`৳${value}`, "Price"]} /><Area type="monotone" dataKey="local" name="Local" stroke="#167a5a" strokeWidth={2.5} fill="url(#localFill)" /><Area type="monotone" dataKey="overseas" name="Overseas" stroke="#8bb9e8" strokeWidth={2.5} fill="url(#overseasFill)" /></AreaChart></ResponsiveContainer>
              </div>
              <div className="mt-4 rounded-xl bg-canvas px-4 py-3 text-xs leading-5 text-muted"><span className="font-semibold text-ink">Prototype note:</span> the chart uses illustrative trend points; connect it to validated historical records during the analytics milestone.</div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
              <div className="flex items-start justify-between"><div><h2 className="text-sm font-bold">Latest price comparison</h2><p className="mt-1 text-xs text-muted">Cotton Single Jersey · FAB-001</p></div><Link href="/price-comparison" className="text-xs font-semibold text-brand hover:underline">View all</Link></div>
              <div className="mt-5 space-y-4">
                {latestComparison.slice(0, 4).map((row, index) => <div key={`${row.supplierId}-${row.companyUnitId}`} className="flex items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${index === 0 ? "bg-brand-soft text-brand" : "bg-canvas text-muted"}`}>{index === 0 ? <TrendingDown size={17} /> : <Building2 size={16} />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{row.supplierName}</p><p className="mt-1 truncate text-[10px] text-muted">{row.companyUnitName} · {row.effectiveDate}</p></div><div className="text-right"><p className="text-xs font-bold">{row.priceInBdt ? money(row.priceInBdt) : `${row.currency} ${row.unitPrice.toFixed(2)}`}</p><p className={`mt-1 text-[10px] ${row.isStale ? "text-[#b7791f]" : "text-brand"}`}>{row.isStale ? "Stale price" : row.currency === "BDT" ? "Local price" : "Converted estimate"}</p></div></div>)}
                {latestComparison.length === 0 && <p className="py-8 text-center text-sm text-muted">No price records found for this item.</p>}
              </div>
              <div className="mt-5 border-t border-line pt-4"><div className="flex items-center justify-between text-xs"><span className="text-muted">Recent local price change</span><span className={`flex items-center gap-1 font-semibold ${localChange > 0 ? "text-[#b45345]" : "text-brand"}`}>{localChange > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{localChange > 0 ? "+" : ""}{localChange.toFixed(1)}%</span></div><p className="mt-1 text-[10px] text-muted">Based on the latest and previous demo records.</p></div>
            </section>
          </div>

          <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
            <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-sm font-bold">Recent price records</h2><p className="mt-1 text-xs text-muted">Latest entries across selected company units</p></div><div className="flex flex-wrap gap-2"><label className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 md:hidden"><Search size={14} className="text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="w-32 bg-transparent text-xs outline-none" /></label><button className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs text-[#58635e] hover:bg-canvas"><Filter size={14} /> Filters</button><button className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs text-[#58635e] hover:bg-canvas"><Download size={14} /> Export</button></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wider text-[#89948e]"><tr><th className="px-6 py-3.5">Item</th><th className="px-4 py-3.5">Supplier</th><th className="px-4 py-3.5">Company unit</th><th className="px-4 py-3.5">Date</th><th className="px-4 py-3.5">Price</th><th className="px-6 py-3.5">Type</th></tr></thead><tbody className="divide-y divide-line">{recentRecords.map((record) => { const item = items.find((entry) => entry.id === record.itemId); const supplier = suppliers.find((entry) => entry.id === record.supplierId); const unit = companyUnits.find((entry) => entry.id === record.companyUnitId); return <tr key={record.id} className="transition hover:bg-[#fbfcfb]"><td className="px-6 py-4"><div className="font-semibold text-xs">{item?.name}</div><div className="mt-1 text-[10px] text-muted">{item?.code} · per {record.measurementUnit}</div></td><td className="px-4 py-4"><div className="text-xs font-medium">{supplier?.name}</div><div className="mt-1 text-[10px] text-muted">{supplier?.country}</div></td><td className="px-4 py-4 text-xs text-[#58635e]">{unit?.name}</td><td className="px-4 py-4 text-xs text-[#58635e]">{record.effectiveDate}</td><td className="px-4 py-4"><div className="text-xs font-bold">{money(record.unitPrice, record.currency)}</div>{record.currency !== "BDT" && <div className="mt-1 text-[10px] text-muted">{record.exchangeRateToBdt ? `≈ ${money(record.unitPrice * record.exchangeRateToBdt)}` : "No BDT rate"}</div>}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${supplier?.type === "local" ? "bg-brand-soft text-brand-dark" : "bg-[#eaf2fc] text-[#326ca8]"}`}><span className={`h-1.5 w-1.5 rounded-full ${supplier?.type === "local" ? "bg-brand" : "bg-[#5b95d1]"}`} />{supplier?.type === "local" ? "Local" : "Overseas"}</span></td></tr>; })}</tbody></table></div>
            <div className="flex flex-col gap-2 border-t border-line px-6 py-4 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between"><span>Showing {recentRecords.length} of {priceRecords.length} demo records</span><span>Prices are sample data and not purchasing advice.</span></div>
          </section>

          <footer className="flex flex-col gap-2 py-6 text-[10px] text-[#9aa49e] sm:flex-row sm:items-center sm:justify-between"><span>Price Tracker · Foundation milestone</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Demo mode · Backend not connected</span></footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, detail, icon, tone, trend }: { title: string; value: string; detail: string; icon: React.ReactNode; tone: "green" | "blue" | "purple" | "amber"; trend: string }) {
  const tones = { green: "bg-brand-soft text-brand", blue: "bg-[#eaf2fc] text-[#397bb8]", purple: "bg-[#f1ebff] text-[#8260c4]", amber: "bg-[#fff3df] text-[#b7791f]" };
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-panel transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted">{title}</p><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div></div><p className="mt-4 text-[26px] font-bold tracking-tight">{value}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] text-muted">{detail}</p><span className="text-[10px] font-medium text-brand">{trend}</span></div></div>;
}
