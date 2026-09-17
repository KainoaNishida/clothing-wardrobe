import { useEffect, useMemo, useState } from "react";
import { Box, Database, Link2, Plus, Shirt, SlidersHorizontal } from "lucide-react";
import { CLOTHING_CATEGORIES, type ClothingCategory, sampleWardrobeItems } from "@cw/domain";
import { createMannequinParameters, sampleBodyMeasurements } from "@cw/measurement";
import { createOutfitShells } from "@cw/garments";
import { getRuleBasedOutfitIdeas } from "@cw/recommender";
import { WardrobeScene, type CameraPreset } from "@cw/renderer";
import { appGetStatus } from "../tauri/api-client";
import type { AppStatus } from "../tauri/dto";
import { WardrobeCatalogue } from "../features/wardrobe/WardrobeCatalogue";

export function App() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ClothingCategory | "all">("all");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("front");
  const [selectedIds, setSelectedIds] = useState<string[]>(["jacket-01", "top-01", "pants-01", "shoes-01"]);

  useEffect(() => {
    appGetStatus()
      .then(setStatus)
      .catch((error: unknown) => setStatusError(error instanceof Error ? error.message : String(error)));
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sampleWardrobeItems.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const searchable = `${item.name} ${item.brand ?? ""} ${item.category} ${item.primaryColor}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query]);

  const selectedItems = useMemo(
    () => sampleWardrobeItems.filter((item) => selectedIds.includes(item.id)),
    [selectedIds]
  );

  const mannequin = useMemo(() => createMannequinParameters(sampleBodyMeasurements), []);
  const shells = useMemo(() => createOutfitShells(selectedItems), [selectedItems]);
  const ideas = useMemo(() => getRuleBasedOutfitIdeas(sampleWardrobeItems), []);

  function toggleItem(itemId: string) {
    setSelectedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
    );
  }

  return (
    <main className="app-shell">
      <section className="catalogue-pane" aria-label="Wardrobe catalogue">
        <header className="app-header">
          <div>
            <p className="eyebrow">Clothing Wardrobe</p>
            <h1>Outfit Builder</h1>
          </div>
          <div className={status?.databaseReady ? "status-pill is-ready" : "status-pill"}>
            <Database size={14} aria-hidden="true" />
            <span>{status?.databaseReady ? "Local" : statusError ? "Offline" : "Starting"}</span>
          </div>
        </header>

        <div className="action-row">
          <button className="primary-action" type="button">
            <Plus size={16} aria-hidden="true" />
            <span>Add Item</span>
          </button>
          <button className="icon-action" type="button" aria-label="Upload clothing photo" title="Upload clothing photo">
            <Shirt size={17} aria-hidden="true" />
          </button>
          <button className="icon-action" type="button" aria-label="Import product link" title="Import product link">
            <Link2 size={17} aria-hidden="true" />
          </button>
        </div>

        <WardrobeCatalogue
          categories={CLOTHING_CATEGORIES}
          category={category}
          items={filteredItems}
          query={query}
          selectedIds={selectedIds}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onToggleItem={toggleItem}
        />

        <section className="ideas-panel" aria-label="Outfit ideas">
          <div className="panel-heading">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <h2>Ideas</h2>
          </div>
          <div className="idea-list">
            {ideas.slice(0, 2).map((idea) => (
              <button className="idea-card" key={idea.id} type="button" onClick={() => setSelectedIds(idea.itemIds)}>
                <span>{idea.name}</span>
                <small>{idea.reason}</small>
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="viewer-pane" aria-label="3D outfit viewer">
        <div className="viewer-toolbar">
          {(["front", "side", "back", "reset"] as CameraPreset[]).map((preset) => (
            <button
              className={cameraPreset === preset ? "view-button is-active" : "view-button"}
              key={preset}
              type="button"
              onClick={() => setCameraPreset(preset)}
            >
              <Box size={15} aria-hidden="true" />
              <span>{preset}</span>
            </button>
          ))}
        </div>
        <WardrobeScene cameraPreset={cameraPreset} garmentShells={shells} mannequin={mannequin} />
      </section>
    </main>
  );
}
