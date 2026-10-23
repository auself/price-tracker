import type { PriceRecord, PriceComparisonRow } from "@/types";
import { companyUnits, suppliers } from "@/data/demo-data";

export function getPriceInBdt(record: PriceRecord): number | null {
  if (record.currency === "BDT") return record.unitPrice;
  if (!record.exchangeRateToBdt || record.exchangeRateToBdt <= 0) return null;
  return record.unitPrice * record.exchangeRateToBdt;
}

export function getLatestPricePerSupplierAndUnit(
  records: PriceRecord[],
  itemId: string,
  staleAfterDays = 30,
  today = new Date(),
): PriceComparisonRow[] {
  const latest = new Map<string, PriceRecord>();

  for (const record of records) {
    if (record.itemId !== itemId) continue;
    const key = `${record.supplierId}::${record.companyUnitId}`;
    const existing = latest.get(key);
    if (!existing || record.effectiveDate > existing.effectiveDate) latest.set(key, record);
  }

  return [...latest.values()]
    .map((record) => {
      const supplier = suppliers.find((entry) => entry.id === record.supplierId);
      const unit = companyUnits.find((entry) => entry.id === record.companyUnitId);
      const ageDays = Math.floor((today.getTime() - new Date(record.effectiveDate).getTime()) / 86_400_000);
      return {
        supplierId: record.supplierId,
        supplierName: supplier?.name ?? "Unknown supplier",
        companyUnitId: record.companyUnitId,
        companyUnitName: unit?.name ?? "Unknown unit",
        unitPrice: record.unitPrice,
        currency: record.currency,
        effectiveDate: record.effectiveDate,
        isStale: ageDays > staleAfterDays,
        priceInBdt: getPriceInBdt(record) ?? undefined,
      };
    })
    .sort((a, b) => (a.priceInBdt ?? Number.POSITIVE_INFINITY) - (b.priceInBdt ?? Number.POSITIVE_INFINITY));
}

export function getPricesForSelectedDate(
  records: PriceRecord[],
  itemId: string,
  selectedDate: string,
): PriceRecord[] {
  return records.filter(
    (record) => record.itemId === itemId && record.effectiveDate === selectedDate,
  );
}

export function getPriceDifference(
  comparedPrice: number,
  referencePrice: number,
): { difference: number; percentage: number | null } {
  const difference = comparedPrice - referencePrice;
  return {
    difference,
    percentage: referencePrice === 0 ? null : (difference / referencePrice) * 100,
  };
}

export function getPriceSpread(prices: number[]): number | null {
  if (prices.length < 2) return null;
  return Math.max(...prices) - Math.min(...prices);
}
