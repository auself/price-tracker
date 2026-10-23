import type { CurrencyCode, PriceRecord } from "@/types";

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ValidationResult<T> =
  | { success: true; data: T; issues: [] }
  | { success: false; issues: ValidationIssue[] };

const CURRENCIES: CurrencyCode[] = ["BDT", "USD", "EUR", "CNY", "INR"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export type PriceRecordInput = Omit<PriceRecord, "id" | "createdAt"> & Partial<Pick<PriceRecord, "id" | "createdAt">>;

export function validatePriceRecord(
  input: PriceRecordInput,
  knownIds?: { itemIds?: string[]; supplierIds?: string[]; companyUnitIds?: string[] },
): ValidationResult<PriceRecordInput> {
  const issues: ValidationIssue[] = [];
  if (!input.itemId.trim()) issues.push({ field: "itemId", message: "Select an item." });
  else if (knownIds?.itemIds && !knownIds.itemIds.includes(input.itemId)) issues.push({ field: "itemId", message: "The selected item does not exist." });

  if (!input.supplierId.trim()) issues.push({ field: "supplierId", message: "Select a supplier." });
  else if (knownIds?.supplierIds && !knownIds.supplierIds.includes(input.supplierId)) issues.push({ field: "supplierId", message: "The selected supplier does not exist." });

  if (!input.companyUnitId.trim()) issues.push({ field: "companyUnitId", message: "Select a company unit." });
  else if (knownIds?.companyUnitIds && !knownIds.companyUnitIds.includes(input.companyUnitId)) issues.push({ field: "companyUnitId", message: "The selected company unit does not exist." });

  if (!isRealIsoDate(input.effectiveDate)) issues.push({ field: "effectiveDate", message: "Enter a real date in YYYY-MM-DD format." });
  if (!Number.isFinite(input.unitPrice) || input.unitPrice <= 0) issues.push({ field: "unitPrice", message: "Price must be a number greater than zero." });
  if (!CURRENCIES.includes(input.currency)) issues.push({ field: "currency", message: "Choose a supported currency." });
  if (!input.measurementUnit.trim()) issues.push({ field: "measurementUnit", message: "Measurement unit is required." });
  if (input.currency !== "BDT" && (!Number.isFinite(input.exchangeRateToBdt) || (input.exchangeRateToBdt ?? 0) <= 0)) {
    issues.push({ field: "exchangeRateToBdt", message: "Foreign-currency prices require a positive BDT exchange rate." });
  }
  if (input.currency === "BDT" && input.exchangeRateToBdt !== undefined && input.exchangeRateToBdt !== 1) {
    issues.push({ field: "exchangeRateToBdt", message: "BDT records should not need a foreign exchange rate." });
  }

  if (issues.length) return { success: false, issues };
  return {
    success: true,
    data: {
      ...input,
      remarks: input.remarks?.trim() || undefined,
    },
    issues: [],
  };
}

export function findDuplicatePriceRecord(
  candidate: Pick<PriceRecord, "itemId" | "supplierId" | "companyUnitId" | "effectiveDate">,
  records: Pick<PriceRecord, "itemId" | "supplierId" | "companyUnitId" | "effectiveDate">[],
  excludeId?: string,
): boolean {
  return records.some((record) =>
    (!excludeId || !("id" in record) || record.id !== excludeId) &&
    record.itemId === candidate.itemId &&
    record.supplierId === candidate.supplierId &&
    record.companyUnitId === candidate.companyUnitId &&
    record.effectiveDate === candidate.effectiveDate
  );
}

export function validateUniqueCode(
  code: string,
  existing: { id: string; code: string }[],
  excludeId?: string,
): ValidationResult<string> {
  const normalised = code.trim();
  if (!normalised) return { success: false, issues: [{ field: "code", message: "Code is required." }] };
  const duplicate = existing.some((record) => record.id !== excludeId && record.code.trim().toLowerCase() === normalised.toLowerCase());
  if (duplicate) return { success: false, issues: [{ field: "code", message: "This code is already in use." }] };
  return { success: true, data: normalised, issues: [] };
}
