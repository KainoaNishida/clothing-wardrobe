import type { WardrobeItem } from "@cw/domain";

export interface OutfitIdea {
  id: string;
  name: string;
  reason: string;
  itemIds: string[];
}

export function getRuleBasedOutfitIdeas(items: WardrobeItem[]): OutfitIdea[] {
  const byCategory = new Map(items.map((item) => [item.category, item]));
  const core = ["outerwear", "tops", "pants", "shoes"]
    .map((category) => byCategory.get(category as WardrobeItem["category"])?.id)
    .filter(Boolean) as string[];
  const relaxed = ["tops", "pants", "shoes"]
    .map((category) => byCategory.get(category as WardrobeItem["category"])?.id)
    .filter(Boolean) as string[];

  return [
    {
      id: "idea-core",
      name: "Layered Daily",
      reason: "Top, pants, shoes, outerwear",
      itemIds: core
    },
    {
      id: "idea-relaxed",
      name: "Light Rotation",
      reason: "Simple core outfit",
      itemIds: relaxed
    }
  ].filter((idea) => idea.itemIds.length >= 3);
}
