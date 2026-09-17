import { Search } from "lucide-react";
import type { ClothingCategory, WardrobeItem } from "@cw/domain";

interface WardrobeCatalogueProps {
  categories: readonly ClothingCategory[];
  category: ClothingCategory | "all";
  items: WardrobeItem[];
  query: string;
  selectedIds: string[];
  onCategoryChange: (category: ClothingCategory | "all") => void;
  onQueryChange: (query: string) => void;
  onToggleItem: (itemId: string) => void;
}

export function WardrobeCatalogue({
  categories,
  category,
  items,
  query,
  selectedIds,
  onCategoryChange,
  onQueryChange,
  onToggleItem
}: WardrobeCatalogueProps) {
  return (
    <section className="wardrobe-panel" aria-label="Wardrobe items">
      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          aria-label="Search wardrobe"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search"
          type="search"
          value={query}
        />
      </label>

      <div className="category-tabs" aria-label="Category filter">
        <button className={category === "all" ? "category-tab is-active" : "category-tab"} onClick={() => onCategoryChange("all")} type="button">
          All
        </button>
        {categories.map((itemCategory) => (
          <button
            className={category === itemCategory ? "category-tab is-active" : "category-tab"}
            key={itemCategory}
            onClick={() => onCategoryChange(itemCategory)}
            type="button"
          >
            {itemCategory}
          </button>
        ))}
      </div>

      <div className="wardrobe-list">
        {items.map((item) => {
          const selected = selectedIds.includes(item.id);

          return (
            <button
              className={selected ? "wardrobe-item is-selected" : "wardrobe-item"}
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              type="button"
            >
              <span className="item-swatch" style={{ background: item.swatch }} />
              <span className="item-copy">
                <strong>{item.name}</strong>
                <small>
                  {item.brand} · {item.category}
                </small>
              </span>
              <span className="item-size">{item.sizeLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
