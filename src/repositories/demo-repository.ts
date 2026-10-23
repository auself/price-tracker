import { companyUnits, categories, items, priceRecords, suppliers } from "@/data/demo-data";
import type { CompanyUnit, Item, ItemCategory, PriceRecord, Supplier } from "@/types";
import type { ListOptions, ReadRepository } from "@/services/contracts";

function matchesSearch<T>(record: T, search?: string): boolean {
  return !search || JSON.stringify(record).toLowerCase().includes(search.toLowerCase());
}

function createReadOnlyDemoRepository<T extends { id: string }>(source: T[]): ReadRepository<T> {
  const snapshot = source.map((record) => ({ ...record }));
  return {
    async list(options: ListOptions = {}) {
      const filtered = snapshot.filter((record) =>
        matchesSearch(record, options.search) &&
        (!options.activeOnly || !("active" in record) || record.active === true)
      );
      const offset = Math.max(0, options.offset ?? 0);
      const result = options.limit === undefined ? filtered.slice(offset) : filtered.slice(offset, offset + Math.max(0, options.limit));
      return result.map((record) => ({ ...record }));
    },
    async getById(id: string) {
      const record = snapshot.find((entry) => entry.id === id);
      return record ? { ...record } : null;
    },
  };
}

/**
 * Read-only demo adapters for testing page/service wiring.
 * These are snapshots, not persistence; mutations belong in a real repository adapter.
 */
export function createDemoReadRepositories(): {
  items: ReadRepository<Item>;
  categories: ReadRepository<ItemCategory>;
  suppliers: ReadRepository<Supplier>;
  companyUnits: ReadRepository<CompanyUnit>;
  priceRecords: ReadRepository<PriceRecord>;
} {
  return {
    items: createReadOnlyDemoRepository(items),
    categories: createReadOnlyDemoRepository(categories),
    suppliers: createReadOnlyDemoRepository(suppliers),
    companyUnits: createReadOnlyDemoRepository(companyUnits),
    priceRecords: createReadOnlyDemoRepository(priceRecords),
  };
}
