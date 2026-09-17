export const CLOTHING_CATEGORIES = ["tops", "pants", "shoes", "outerwear", "accessories"] as const;

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

export interface WardrobeItem {
  id: string;
  name: string;
  brand?: string;
  category: ClothingCategory;
  primaryColor: string;
  swatch: string;
  sizeLabel: string;
  warmth?: "light" | "medium" | "heavy";
}

export const sampleWardrobeItems: WardrobeItem[] = [
  {
    id: "jacket-01",
    name: "Cropped Field Jacket",
    brand: "Sample",
    category: "outerwear",
    primaryColor: "olive",
    swatch: "#5f6a45",
    sizeLabel: "M",
    warmth: "medium"
  },
  {
    id: "top-01",
    name: "Ribbed Crew Tee",
    brand: "Sample",
    category: "tops",
    primaryColor: "bone",
    swatch: "#d8ceb9",
    sizeLabel: "M",
    warmth: "light"
  },
  {
    id: "pants-01",
    name: "Wide-Leg Trouser",
    brand: "Sample",
    category: "pants",
    primaryColor: "charcoal",
    swatch: "#3d3b39",
    sizeLabel: "32",
    warmth: "medium"
  },
  {
    id: "shoes-01",
    name: "Low Leather Sneaker",
    brand: "Sample",
    category: "shoes",
    primaryColor: "black",
    swatch: "#111111",
    sizeLabel: "10",
    warmth: "light"
  },
  {
    id: "accessory-01",
    name: "Brushed Belt",
    brand: "Sample",
    category: "accessories",
    primaryColor: "tan",
    swatch: "#a7794f",
    sizeLabel: "OS"
  }
];
