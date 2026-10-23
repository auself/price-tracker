import type {
  CompanyUnit,
  Item,
  ItemCategory,
  PriceRecord,
  Supplier,
} from "@/types";

export const companyUnits: CompanyUnit[] = [
  { id: "unit-dhaka", code: "DHK", name: "Dhaka Unit" },
  { id: "unit-gazipur", code: "GZP", name: "Gazipur Unit" },
  { id: "unit-chattogram", code: "CTG", name: "Chattogram Unit" },
];

export const categories: ItemCategory[] = [
  { id: "fabric", name: "Fabric" },
  { id: "yarn", name: "Yarn" },
  { id: "accessories", name: "Accessories" },
  { id: "chemicals", name: "Chemicals" },
];

export const items: Item[] = [
  { id: "item-001", code: "FAB-001", name: "Cotton Single Jersey", categoryId: "fabric", unitOfMeasure: "kg", specification: "180 GSM · 100% cotton", active: true },
  { id: "item-002", code: "FAB-002", name: "Polyester Mesh Fabric", categoryId: "fabric", unitOfMeasure: "kg", specification: "140 GSM · 100% polyester", active: true },
  { id: "item-003", code: "YRN-001", name: "30/1 Combed Cotton Yarn", categoryId: "yarn", unitOfMeasure: "kg", specification: "Combed · Ring spun", active: true },
  { id: "item-004", code: "ACC-001", name: "Polyester Sewing Thread", categoryId: "accessories", unitOfMeasure: "cone", specification: "40/2 · White", active: true },
  { id: "item-005", code: "CHM-001", name: "Reactive Dye Black", categoryId: "chemicals", unitOfMeasure: "kg", specification: "Textile grade", active: true },
];

export const suppliers: Supplier[] = [
  { id: "sup-001", code: "SUP-001", name: "Bengal Textile Supply", type: "local", country: "Bangladesh", defaultCurrency: "BDT", active: true },
  { id: "sup-002", code: "SUP-002", name: "Eastern Yarn Traders", type: "local", country: "Bangladesh", defaultCurrency: "BDT", active: true },
  { id: "sup-003", code: "SUP-003", name: "Shanghai Fabric Co.", type: "overseas", country: "China", defaultCurrency: "USD", active: true },
  { id: "sup-004", code: "SUP-004", name: "Surat Dyeing Materials", type: "overseas", country: "India", defaultCurrency: "INR", active: true },
  { id: "sup-005", code: "SUP-005", name: "Global Thread Exports", type: "overseas", country: "Vietnam", defaultCurrency: "USD", active: true },
];

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export const priceRecords: PriceRecord[] = [
  { id: "price-001", itemId: "item-001", supplierId: "sup-001", companyUnitId: "unit-dhaka", effectiveDate: daysAgo(2), unitPrice: 420, currency: "BDT", measurementUnit: "kg", createdAt: daysAgo(2) },
  { id: "price-002", itemId: "item-001", supplierId: "sup-003", companyUnitId: "unit-dhaka", effectiveDate: daysAgo(5), unitPrice: 3.42, currency: "USD", measurementUnit: "kg", exchangeRateToBdt: 121.5, createdAt: daysAgo(5) },
  { id: "price-003", itemId: "item-001", supplierId: "sup-001", companyUnitId: "unit-gazipur", effectiveDate: daysAgo(7), unitPrice: 415, currency: "BDT", measurementUnit: "kg", createdAt: daysAgo(7) },
  { id: "price-004", itemId: "item-003", supplierId: "sup-002", companyUnitId: "unit-dhaka", effectiveDate: daysAgo(1), unitPrice: 865, currency: "BDT", measurementUnit: "kg", createdAt: daysAgo(1) },
  { id: "price-005", itemId: "item-003", supplierId: "sup-003", companyUnitId: "unit-gazipur", effectiveDate: daysAgo(4), unitPrice: 6.8, currency: "USD", measurementUnit: "kg", exchangeRateToBdt: 121.5, createdAt: daysAgo(4) },
  { id: "price-006", itemId: "item-004", supplierId: "sup-005", companyUnitId: "unit-chattogram", effectiveDate: daysAgo(3), unitPrice: 1.15, currency: "USD", measurementUnit: "cone", exchangeRateToBdt: 121.5, createdAt: daysAgo(3) },
  { id: "price-007", itemId: "item-005", supplierId: "sup-004", companyUnitId: "unit-dhaka", effectiveDate: daysAgo(9), unitPrice: 540, currency: "INR", measurementUnit: "kg", exchangeRateToBdt: 1.42, createdAt: daysAgo(9) },
  { id: "price-008", itemId: "item-002", supplierId: "sup-003", companyUnitId: "unit-gazipur", effectiveDate: daysAgo(12), unitPrice: 2.7, currency: "USD", measurementUnit: "kg", exchangeRateToBdt: 121.5, createdAt: daysAgo(12) },
  { id: "price-009", itemId: "item-002", supplierId: "sup-001", companyUnitId: "unit-chattogram", effectiveDate: daysAgo(6), unitPrice: 335, currency: "BDT", measurementUnit: "kg", createdAt: daysAgo(6) },
  { id: "price-010", itemId: "item-001", supplierId: "sup-001", companyUnitId: "unit-dhaka", effectiveDate: daysAgo(32), unitPrice: 408, currency: "BDT", measurementUnit: "kg", createdAt: daysAgo(32) },
];
