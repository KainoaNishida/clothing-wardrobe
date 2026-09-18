import { RotateCcw, Ruler, Save } from "lucide-react";
import {
  bodyMeasurementFields,
  fineTuneRangeForBodyMeasurement,
  mannequinTemplateGrid,
  measurementStepForUnit,
  measurementUnitLabel,
  measurementValueForUnit,
  measurementValueToCm,
  type BodyMeasurementKey,
  type BodyMeasurements,
  type BodyMeasurementValidationResult,
  type MannequinTemplateId,
  type UnitSystem
} from "@cw/measurement";

export type BodyProfileSaveState = "idle" | "loading" | "saving" | "saved" | "error";

interface BodyProfilePanelProps {
  displayName: string;
  measurements: BodyMeasurements;
  saveMessage: string | null;
  saveState: BodyProfileSaveState;
  templateId: MannequinTemplateId;
  unitSystem: UnitSystem;
  validation: BodyMeasurementValidationResult;
  onDisplayNameChange: (value: string) => void;
  onMeasurementChange: (key: BodyMeasurementKey, valueCm: number) => void;
  onReset: () => void;
  onSave: () => void;
  onTemplateChange: (templateId: MannequinTemplateId) => void;
  onUnitSystemChange: (unitSystem: UnitSystem) => void;
}

export function BodyProfilePanel({
  displayName,
  measurements,
  onDisplayNameChange,
  onMeasurementChange,
  onReset,
  onSave,
  onTemplateChange,
  onUnitSystemChange,
  saveMessage,
  saveState,
  templateId,
  unitSystem,
  validation
}: BodyProfilePanelProps) {
  const unitLabel = measurementUnitLabel(unitSystem);
  const isBusy = saveState === "loading" || saveState === "saving";

  return (
    <section className="body-profile-panel" aria-label="Body profile">
      <div className="body-profile-toolbar">
        <div className="panel-heading">
          <Ruler size={16} aria-hidden="true" />
          <h2>Body Profile</h2>
        </div>
        <div className="unit-toggle" aria-label="Measurement unit">
          {(["metric", "imperial"] as UnitSystem[]).map((system) => (
            <button
              className={unitSystem === system ? "unit-button is-active" : "unit-button"}
              key={system}
              type="button"
              onClick={() => onUnitSystemChange(system)}
            >
              {system === "metric" ? "cm" : "in"}
            </button>
          ))}
        </div>
      </div>

      <label className="profile-name-field">
        <span>Name</span>
        <input
          autoComplete="off"
          maxLength={80}
          type="text"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.currentTarget.value)}
        />
      </label>

      <div className="template-selector" aria-label="Body template">
        {mannequinTemplateGrid.map((row) => (
          <div className="template-row" key={row[0]?.heightClass}>
            {row.map((template) => (
              <button
                className={template.id === templateId ? "template-button is-active" : "template-button"}
                key={template.id}
                type="button"
                onClick={() => onTemplateChange(template.id)}
              >
                <span>{template.heightLabel}</span>
                <strong>{template.buildLabel}</strong>
              </button>
            ))}
          </div>
        ))}
      </div>

      <details className="fine-tune-panel">
        <summary>Fine tune</summary>
        <div className="measurement-grid">
          {bodyMeasurementFields.map((field) => {
            const issue = validation.issuesByKey[field.key];
            const range = fineTuneRangeForBodyMeasurement(templateId, field.key);
            const value = measurements[field.key];
            const displayValue = Number.isFinite(value) ? measurementValueForUnit(value, unitSystem) : "";

            return (
              <label className={issue ? "measurement-field has-error" : "measurement-field"} key={field.key}>
                <span>{field.label}</span>
                <div className="measurement-input-row">
                  <input
                    max={measurementValueForUnit(range.maxCm, unitSystem)}
                    min={measurementValueForUnit(range.minCm, unitSystem)}
                    step={measurementStepForUnit(field.stepCm, unitSystem)}
                    type="number"
                    value={displayValue}
                    onChange={(event) => {
                      const nextValue = event.currentTarget.valueAsNumber;
                      onMeasurementChange(
                        field.key,
                        Number.isNaN(nextValue) ? Number.NaN : measurementValueToCm(nextValue, unitSystem)
                      );
                    }}
                  />
                  <span>{unitLabel}</span>
                </div>
                {issue ? <small>{issue}</small> : null}
              </label>
            );
          })}
        </div>
      </details>

      <div className="body-profile-actions">
        <button className="secondary-action" disabled={isBusy} type="button" onClick={onReset}>
          <RotateCcw size={15} aria-hidden="true" />
          <span>Reset</span>
        </button>
        <button className="primary-action" disabled={isBusy || !validation.isValid} type="button" onClick={onSave}>
          <Save size={15} aria-hidden="true" />
          <span>{saveState === "saving" ? "Saving" : "Save"}</span>
        </button>
      </div>

      {saveMessage ? <p className={saveState === "error" ? "save-message is-error" : "save-message"}>{saveMessage}</p> : null}
    </section>
  );
}
