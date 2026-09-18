import {
  cmToMeters,
  defaultMannequinTemplateId,
  measurementsForMannequinTemplate,
  type MannequinBodyModel,
  type MannequinTemplateId
} from "@cw/measurement";
import { mannequinAssetUrls } from "./mannequinAssets";

export interface MannequinAssetControls {
  assetUrl: string;
  position: [number, number, number];
  scale: [number, number, number];
  templateId: MannequinTemplateId;
}

export function createMannequinAssetControls(body: MannequinBodyModel): MannequinAssetControls {
  const templateId = body.templateId ?? defaultMannequinTemplateId;
  const templateMeasurements = measurementsForMannequinTemplate(templateId);
  const templateHeight = cmToMeters(templateMeasurements.heightCm);
  const heightScale = clamp(body.heightMeters / templateHeight, 0.94, 1.06);
  const widthScale = clamp(getWidthRatio(body, templateMeasurements), 0.94, 1.06);
  const depthScale = clamp(getDepthRatio(body, templateMeasurements), 0.95, 1.05);

  return {
    assetUrl: mannequinAssetUrls[templateId],
    position: [0, 0.02, 0],
    scale: [widthScale, heightScale, depthScale],
    templateId
  };
}

function getWidthRatio(body: MannequinBodyModel, templateMeasurements: ReturnType<typeof measurementsForMannequinTemplate>) {
  const templateShoulder = cmToMeters(templateMeasurements.shoulderWidthCm);
  const templateChestRadius = circumferenceToRadiusMeters(templateMeasurements.chestCircumferenceCm) * 1.17;
  const templateHipRadius = circumferenceToRadiusMeters(templateMeasurements.hipCircumferenceCm) * 1.2;

  return average([
    body.dimensions.shoulderWidth / templateShoulder,
    body.dimensions.chestRadiusX / templateChestRadius,
    body.dimensions.hipRadiusX / templateHipRadius
  ]);
}

function getDepthRatio(body: MannequinBodyModel, templateMeasurements: ReturnType<typeof measurementsForMannequinTemplate>) {
  const templateChestRadius = circumferenceToRadiusMeters(templateMeasurements.chestCircumferenceCm) * 0.72;
  const templateHipRadius = circumferenceToRadiusMeters(templateMeasurements.hipCircumferenceCm) * 0.74;

  return average([body.dimensions.chestRadiusZ / templateChestRadius, body.dimensions.hipRadiusZ / templateHipRadius]);
}

function circumferenceToRadiusMeters(valueCm: number) {
  return valueCm / (100 * Math.PI * 2);
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
