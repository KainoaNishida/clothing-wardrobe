export interface ProductImportDraft {
  sourceUrl: string;
  status: "pending" | "ready" | "failed";
  title?: string;
  brand?: string;
}
