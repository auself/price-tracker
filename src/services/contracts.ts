import type {
  CompanyUnit,
  Item,
  ItemCategory,
  PriceRecord,
  Supplier,
} from "@/types";

export type ListOptions = {
  search?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
};

export interface ReadRepository<T> {
  list(options?: ListOptions): Promise<T[]>;
  getById(id: string): Promise<T | null>;
}

export interface MutableRepository<T extends { id: string }> extends ReadRepository<T> {
  create(input: Omit<T, "id">): Promise<T>;
  update(id: string, input: Partial<Omit<T, "id">>): Promise<T>;
  deactivate?(id: string): Promise<void>;
}

export type ItemRepository = MutableRepository<Item>;
export type CategoryRepository = MutableRepository<ItemCategory>;
export type SupplierRepository = MutableRepository<Supplier>;
export type CompanyUnitRepository = MutableRepository<CompanyUnit>;

export interface PriceRecordRepository extends ReadRepository<PriceRecord> {
  listByItem(itemId: string): Promise<PriceRecord[]>;
  listByDateRange(from: string, to: string): Promise<PriceRecord[]>;
  create(input: Omit<PriceRecord, "id" | "createdAt">): Promise<PriceRecord>;
}

export type SuggestionStatus = "pending" | "accepted" | "rejected";

export interface PriceSuggestion {
  id: string;
  itemId: string;
  priceRecordId?: string;
  effectiveDate?: string;
  details: string;
  reason: string;
  status: SuggestionStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewerResponse?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface SuggestionRepository extends ReadRepository<PriceSuggestion> {
  listPending(): Promise<PriceSuggestion[]>;
  create(input: Omit<PriceSuggestion, "id" | "createdAt" | "status">): Promise<PriceSuggestion>;
  review(id: string, status: Exclude<SuggestionStatus, "pending">, response?: string): Promise<PriceSuggestion>;
}

export interface PriceTrackerServices {
  items: ItemRepository;
  categories: CategoryRepository;
  suppliers: SupplierRepository;
  companyUnits: CompanyUnitRepository;
  priceRecords: PriceRecordRepository;
  suggestions: SuggestionRepository;
}
