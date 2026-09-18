import { useEffect, useMemo, useState } from "react";
import { Box, Database, Link2, Plus, Shirt, SlidersHorizontal, UserRound } from "lucide-react";
import { CLOTHING_CATEGORIES, type ClothingCategory, sampleWardrobeItems } from "@cw/domain";
import {
  applyMannequinTemplateFineTune,
  bodyMeasurementsToRecord,
  defaultBodyMeasurements,
  defaultMannequinTemplateId,
  measurementsForMannequinTemplate,
  normalizeBodyMeasurements,
  resolveMannequinTemplateId,
  solveMannequinBody,
  validateBodyMeasurements,
  type BodyMeasurementKey,
  type BodyMeasurements,
  type MannequinTemplateId,
  type UnitSystem
} from "@cw/measurement";
import { createOutfitShells } from "@cw/garments";
import { getRuleBasedOutfitIdeas } from "@cw/recommender";
import { WardrobeScene, type CameraPreset } from "@cw/renderer";
import { appGetStatus, bodyGetProfile, bodySaveProfile } from "../tauri/api-client";
import type { AppStatus } from "../tauri/dto";
import { BodyProfilePanel, type BodyProfileSaveState } from "../features/body-profile";
import { WardrobeCatalogue } from "../features/wardrobe/WardrobeCatalogue";

type AppMode = "wardrobe" | "bodyProfile";

export function App() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<AppMode>("wardrobe");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ClothingCategory | "all">("all");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("front");
  const [selectedIds, setSelectedIds] = useState<string[]>(["jacket-01", "top-01", "pants-01", "shoes-01"]);
  const [bodyDisplayName, setBodyDisplayName] = useState("Primary profile");
  const [bodyTemplateId, setBodyTemplateId] = useState<MannequinTemplateId>(defaultMannequinTemplateId);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements>(defaultBodyMeasurements);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [bodySaveState, setBodySaveState] = useState<BodyProfileSaveState>("loading");
  const [bodySaveMessage, setBodySaveMessage] = useState<string | null>(null);

  useEffect(() => {
    appGetStatus()
      .then(setStatus)
      .catch((error: unknown) => setStatusError(error instanceof Error ? error.message : String(error)));

    bodyGetProfile()
      .then((profile) => {
        if (profile) {
          const templateId = resolveMannequinTemplateId(profile.templateId);
          setBodyDisplayName(profile.displayName ?? "Primary profile");
          setBodyTemplateId(templateId);
          setBodyMeasurements(applyMannequinTemplateFineTune(templateId, profile.measurements));
          setUnitSystem(profile.unitSystem);
        }

        setBodySaveState("idle");
      })
      .catch((error: unknown) => {
        setBodySaveState("error");
        setBodySaveMessage(error instanceof Error ? error.message : String(error));
      });
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

  const bodyValidation = useMemo(
    () =>
      validateBodyMeasurements(bodyMeasurements, {
        enforceTemplateFineTune: true,
        templateId: bodyTemplateId
      }),
    [bodyMeasurements, bodyTemplateId]
  );
  const mannequinBody = useMemo(
    () => solveMannequinBody(bodyMeasurements, { templateId: bodyTemplateId }),
    [bodyMeasurements, bodyTemplateId]
  );
  const shells = useMemo(() => createOutfitShells(selectedItems), [selectedItems]);
  const ideas = useMemo(() => getRuleBasedOutfitIdeas(sampleWardrobeItems), []);

  function toggleItem(itemId: string) {
    setSelectedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
    );
  }

  function updateBodyMeasurement(key: BodyMeasurementKey, valueCm: number) {
    setBodyMeasurements((current) => ({ ...current, [key]: valueCm }));
    setBodySaveState("idle");
    setBodySaveMessage(null);
  }

  function updateBodyTemplate(templateId: MannequinTemplateId) {
    setBodyTemplateId(templateId);
    setBodyMeasurements(measurementsForMannequinTemplate(templateId));
    setBodySaveState("idle");
    setBodySaveMessage(null);
  }

  function resetBodyDraft() {
    setBodyMeasurements(measurementsForMannequinTemplate(bodyTemplateId));
    setBodySaveState("idle");
    setBodySaveMessage(null);
  }

  async function saveBodyProfile() {
    if (!bodyValidation.isValid) {
      setBodySaveState("error");
      setBodySaveMessage("Fix measurements before saving");
      return;
    }

    setBodySaveState("saving");
    setBodySaveMessage(null);

    try {
      const profile = await bodySaveProfile({
        displayName: bodyDisplayName.trim() || null,
        measurements: bodyMeasurementsToRecord(bodyMeasurements),
        templateId: bodyTemplateId,
        unitSystem
      });

      const templateId = resolveMannequinTemplateId(profile.templateId);
      setBodyDisplayName(profile.displayName ?? "Primary profile");
      setBodyTemplateId(templateId);
      setBodyMeasurements(normalizeBodyMeasurements(profile.measurements, templateId));
      setUnitSystem(profile.unitSystem);
      setBodySaveState("saved");
      setBodySaveMessage("Saved locally");
    } catch (error) {
      setBodySaveState("error");
      setBodySaveMessage(error instanceof Error ? error.message : String(error));
    }
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

        <div className="mode-tabs" aria-label="Workspace mode">
          <button
            className={activeMode === "wardrobe" ? "mode-tab is-active" : "mode-tab"}
            type="button"
            onClick={() => setActiveMode("wardrobe")}
          >
            <Shirt size={15} aria-hidden="true" />
            <span>Wardrobe</span>
          </button>
          <button
            className={activeMode === "bodyProfile" ? "mode-tab is-active" : "mode-tab"}
            type="button"
            onClick={() => setActiveMode("bodyProfile")}
          >
            <UserRound size={15} aria-hidden="true" />
            <span>Body</span>
          </button>
        </div>

        {activeMode === "wardrobe" ? (
          <>
            <div className="action-row">
              <button className="primary-action" type="button">
                <Plus size={16} aria-hidden="true" />
                <span>Add Item</span>
              </button>
              <button
                className="icon-action"
                type="button"
                aria-label="Upload clothing photo"
                title="Upload clothing photo"
              >
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
          </>
        ) : (
          <BodyProfilePanel
            displayName={bodyDisplayName}
            measurements={bodyMeasurements}
            saveMessage={bodySaveMessage}
            saveState={bodySaveState}
            templateId={bodyTemplateId}
            unitSystem={unitSystem}
            validation={bodyValidation}
            onDisplayNameChange={(value) => {
              setBodyDisplayName(value);
              setBodySaveState("idle");
              setBodySaveMessage(null);
            }}
            onMeasurementChange={updateBodyMeasurement}
            onReset={resetBodyDraft}
            onSave={saveBodyProfile}
            onTemplateChange={updateBodyTemplate}
            onUnitSystemChange={(nextUnitSystem) => {
              setUnitSystem(nextUnitSystem);
              setBodySaveState("idle");
              setBodySaveMessage(null);
            }}
          />
        )}
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
        <WardrobeScene
          body={mannequinBody}
          cameraPreset={cameraPreset}
          garmentShells={shells}
          visualMode={activeMode === "bodyProfile" ? "bodyProfile" : "outfit"}
        />
      </section>
    </main>
  );
}
