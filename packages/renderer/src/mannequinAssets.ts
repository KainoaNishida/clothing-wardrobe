import type { MannequinTemplateId } from "@cw/measurement";

export const mannequinAssetUrls: Record<MannequinTemplateId, string> = {
  short_slim: new URL("../../../assets/mannequin/templates/short_slim.glb", import.meta.url).href,
  short_average: new URL("../../../assets/mannequin/templates/short_average.glb", import.meta.url).href,
  short_wide: new URL("../../../assets/mannequin/templates/short_wide.glb", import.meta.url).href,
  average_slim: new URL("../../../assets/mannequin/templates/average_slim.glb", import.meta.url).href,
  average_average: new URL("../../../assets/mannequin/templates/average_average.glb", import.meta.url).href,
  average_wide: new URL("../../../assets/mannequin/templates/average_wide.glb", import.meta.url).href,
  tall_slim: new URL("../../../assets/mannequin/templates/tall_slim.glb", import.meta.url).href,
  tall_average: new URL("../../../assets/mannequin/templates/tall_average.glb", import.meta.url).href,
  tall_wide: new URL("../../../assets/mannequin/templates/tall_wide.glb", import.meta.url).href
};
