import type { ClothingCategory, WardrobeItem } from "@cw/domain";

export interface GarmentShell {
  id: string;
  category: ClothingCategory;
  color: string;
  layerIndex: number;
}

const CATEGORY_LAYER: Record<ClothingCategory, number> = {
  shoes: 0,
  pants: 1,
  tops: 2,
  accessories: 3,
  outerwear: 4
};

export function createOutfitShells(items: WardrobeItem[]): GarmentShell[] {
  return items
    .map((item) => ({
      id: item.id,
      category: item.category,
      color: item.swatch,
      layerIndex: CATEGORY_LAYER[item.category]
    }))
    .sort((a, b) => a.layerIndex - b.layerIndex);
}
