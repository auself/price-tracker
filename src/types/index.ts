export type SupplierType = "local" | "overseas";
export type UserRole = "super_admin" | "app_admin" | "user";
export type CurrencyCode = "BDT" | "USD" | "EUR" | "CNY" | "INR";

export interface CompanyUnit {
  id: string;
  code: string;
  name: string;
}

export interface ItemCategory {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unitOfMeasure: string;
  specification: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: SupplierType;
  country: string;
  defaultCurrency: CurrencyCode;
  active: boolean;
}

export interface PriceRecord {
  id: string;
  itemId: string;
  supplierId: string;
  companyUnitId: string;
  effectiveDate: string;
  unitPrice: number;
  currency: CurrencyCode;
  measurementUnit: string;
  exchangeRateToBdt?: number;
  remarks?: string;
  createdAt: string;
}

export interface PriceComparisonRow {
  supplierId: string;
  supplierName: string;
  companyUnitId: string;
  companyUnitName: string;
  unitPrice: number;
  currency: CurrencyCode;
  effectiveDate: string;
  isStale: boolean;
  priceInBdt?: number;
}
