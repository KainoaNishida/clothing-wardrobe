import type { BodyMeasurementKey, MannequinTemplateId, UnitSystem } from "@cw/measurement";

export interface AppStatus {
  appName: string;
  architecture: string;
  persistence: string;
  appDataDir: string;
  appLocalDataDir: string;
  databasePath: string;
  databaseReady: boolean;
}

export type BodyMeasurementRecord = Partial<Record<BodyMeasurementKey, number>>;
export type BodyProfileCompleteness = "draft" | "complete";

export interface BodyProfile {
  id: string;
  displayName: string | null;
  unitSystem: UnitSystem;
  templateId: MannequinTemplateId;
  measurementCompleteness: BodyProfileCompleteness;
  measurements: BodyMeasurementRecord;
  createdAt: number;
  updatedAt: number;
}

export interface SaveBodyProfileInput {
  displayName: string | null;
  templateId: MannequinTemplateId;
  unitSystem: UnitSystem;
  measurements: Record<BodyMeasurementKey, number>;
}
