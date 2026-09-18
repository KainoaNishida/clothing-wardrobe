export interface BodyMeasurements {
  heightCm: number;
  shoulderWidthCm: number;
  chestCircumferenceCm: number;
  waistCircumferenceCm: number;
  hipCircumferenceCm: number;
  torsoLengthCm: number;
  inseamCm: number;
  armLengthCm: number;
  footLengthCm: number;
}

export type BodyMeasurementKey = keyof BodyMeasurements;
export type UnitSystem = "metric" | "imperial";
export type MannequinTemplateHeight = "short" | "average" | "tall";
export type MannequinTemplateBuild = "slim" | "average" | "wide";
export type MannequinTemplateId = `${MannequinTemplateHeight}_${MannequinTemplateBuild}`;

export interface MannequinTemplateOption {
  id: MannequinTemplateId;
  label: string;
  heightClass: MannequinTemplateHeight;
  heightLabel: string;
  buildClass: MannequinTemplateBuild;
  buildLabel: string;
  measurements: BodyMeasurements;
}

export interface BodyMeasurementField {
  key: BodyMeasurementKey;
  label: string;
  shortLabel: string;
  minCm: number;
  maxCm: number;
  stepCm: number;
  required: boolean;
}

export interface MannequinParameters {
  heightMeters: number;
  shoulderWidthMeters: number;
  chestRadiusMeters: number;
  waistRadiusMeters: number;
  hipRadiusMeters: number;
  torsoLengthMeters: number;
  legLengthMeters: number;
  armLengthMeters: number;
  footLengthMeters: number;
}

export interface MannequinPoint {
  x: number;
  y: number;
  z: number;
}

export interface MannequinLandmarks {
  floor: MannequinPoint;
  headTop: MannequinPoint;
  headCenter: MannequinPoint;
  neckBase: MannequinPoint;
  neckTop: MannequinPoint;
  shoulderCenter: MannequinPoint;
  leftShoulder: MannequinPoint;
  rightShoulder: MannequinPoint;
  chest: MannequinPoint;
  waist: MannequinPoint;
  pelvis: MannequinPoint;
  crotch: MannequinPoint;
  leftHip: MannequinPoint;
  rightHip: MannequinPoint;
  leftKnee: MannequinPoint;
  rightKnee: MannequinPoint;
  leftAnkle: MannequinPoint;
  rightAnkle: MannequinPoint;
  leftElbow: MannequinPoint;
  rightElbow: MannequinPoint;
  leftWrist: MannequinPoint;
  rightWrist: MannequinPoint;
  leftFootCenter: MannequinPoint;
  rightFootCenter: MannequinPoint;
}

export interface MannequinRingGuide {
  center: MannequinPoint;
  radiusX: number;
  radiusZ: number;
}

export interface MannequinLinearGuide {
  start: MannequinPoint;
  end: MannequinPoint;
}

export interface MannequinGuideAnchors {
  height: MannequinLinearGuide;
  inseam: MannequinLinearGuide;
  shoulders: MannequinLinearGuide;
  chest: MannequinRingGuide;
  waist: MannequinRingGuide;
  hips: MannequinRingGuide;
  arm: MannequinLinearGuide;
  foot: MannequinLinearGuide;
}

export interface MannequinBodyDimensions {
  height: number;
  headHeight: number;
  headRadius: number;
  neckLength: number;
  neckRadius: number;
  shoulderRadius: number;
  shoulderWidth: number;
  torsoLength: number;
  inseam: number;
  chestRadiusX: number;
  chestRadiusZ: number;
  waistRadiusX: number;
  waistRadiusZ: number;
  hipRadiusX: number;
  hipRadiusZ: number;
  upperArmLength: number;
  lowerArmLength: number;
  upperArmRadius: number;
  lowerArmRadius: number;
  upperLegLength: number;
  lowerLegLength: number;
  thighRadius: number;
  calfRadius: number;
  legSpacing: number;
  footLength: number;
  footWidth: number;
  footHeight: number;
}

export interface MannequinSolverDiagnostic {
  key: BodyMeasurementKey | "proportions";
  message: string;
}

export interface MannequinBodyModel {
  heightMeters: number;
  templateId: MannequinTemplateId;
  landmarks: MannequinLandmarks;
  dimensions: MannequinBodyDimensions;
  guides: MannequinGuideAnchors;
  diagnostics: MannequinSolverDiagnostic[];
}

export interface SolveMannequinBodyOptions {
  templateId?: MannequinTemplateId | string | null;
}

export const bodyMeasurementFields: BodyMeasurementField[] = [
  {
    key: "heightCm",
    label: "Height",
    shortLabel: "Height",
    minCm: 80,
    maxCm: 230,
    stepCm: 0.5,
    required: true
  },
  {
    key: "shoulderWidthCm",
    label: "Shoulders",
    shortLabel: "Shoulder",
    minCm: 20,
    maxCm: 80,
    stepCm: 0.5,
    required: true
  },
  {
    key: "chestCircumferenceCm",
    label: "Chest",
    shortLabel: "Chest",
    minCm: 45,
    maxCm: 220,
    stepCm: 0.5,
    required: true
  },
  {
    key: "waistCircumferenceCm",
    label: "Waist",
    shortLabel: "Waist",
    minCm: 35,
    maxCm: 220,
    stepCm: 0.5,
    required: true
  },
  {
    key: "hipCircumferenceCm",
    label: "Hips",
    shortLabel: "Hip",
    minCm: 45,
    maxCm: 230,
    stepCm: 0.5,
    required: true
  },
  {
    key: "torsoLengthCm",
    label: "Torso",
    shortLabel: "Torso",
    minCm: 25,
    maxCm: 110,
    stepCm: 0.5,
    required: true
  },
  {
    key: "inseamCm",
    label: "Inseam",
    shortLabel: "Inseam",
    minCm: 35,
    maxCm: 140,
    stepCm: 0.5,
    required: true
  },
  {
    key: "armLengthCm",
    label: "Arm",
    shortLabel: "Arm",
    minCm: 25,
    maxCm: 110,
    stepCm: 0.5,
    required: true
  },
  {
    key: "footLengthCm",
    label: "Foot",
    shortLabel: "Foot",
    minCm: 10,
    maxCm: 45,
    stepCm: 0.5,
    required: true
  }
];

export const requiredBodyMeasurementKeys = bodyMeasurementFields
  .filter((field) => field.required)
  .map((field) => field.key);

const mannequinTemplateHeights: MannequinTemplateHeight[] = ["short", "average", "tall"];
const mannequinTemplateBuilds: MannequinTemplateBuild[] = ["slim", "average", "wide"];

const templateHeightBaselinesCm: Record<MannequinTemplateHeight, number> = {
  short: 165,
  average: 178,
  tall: 190
};

const templateBuildBaselinesCm: Record<
  MannequinTemplateBuild,
  Pick<
    BodyMeasurements,
    "shoulderWidthCm" | "chestCircumferenceCm" | "waistCircumferenceCm" | "hipCircumferenceCm"
  >
> = {
  slim: {
    shoulderWidthCm: 40,
    chestCircumferenceCm: 88,
    waistCircumferenceCm: 72,
    hipCircumferenceCm: 90
  },
  average: {
    shoulderWidthCm: 45,
    chestCircumferenceCm: 99,
    waistCircumferenceCm: 82,
    hipCircumferenceCm: 99
  },
  wide: {
    shoulderWidthCm: 51,
    chestCircumferenceCm: 114,
    waistCircumferenceCm: 100,
    hipCircumferenceCm: 114
  }
};

const templateFineTuneDeltasCm: Record<BodyMeasurementKey, number> = {
  heightCm: 6,
  shoulderWidthCm: 3.5,
  chestCircumferenceCm: 8,
  waistCircumferenceCm: 8,
  hipCircumferenceCm: 8,
  torsoLengthCm: 4,
  inseamCm: 4,
  armLengthCm: 4,
  footLengthCm: 2
};

export const defaultMannequinTemplateId: MannequinTemplateId = "average_average";

export const mannequinTemplateGrid: MannequinTemplateOption[][] = createMannequinTemplateGrid();

export const mannequinTemplates: MannequinTemplateOption[] = mannequinTemplateGrid.flat();

export const mannequinTemplateIds = mannequinTemplates.map((template) => template.id);

export const defaultBodyMeasurements: BodyMeasurements =
  measurementsForMannequinTemplate(defaultMannequinTemplateId);

export const sampleBodyMeasurements = defaultBodyMeasurements;

export function createMannequinParameters(measurements: BodyMeasurements): MannequinParameters {
  return {
    heightMeters: cmToMeters(measurements.heightCm),
    shoulderWidthMeters: cmToMeters(measurements.shoulderWidthCm),
    chestRadiusMeters: circumferenceToRadiusMeters(measurements.chestCircumferenceCm),
    waistRadiusMeters: circumferenceToRadiusMeters(measurements.waistCircumferenceCm),
    hipRadiusMeters: circumferenceToRadiusMeters(measurements.hipCircumferenceCm),
    torsoLengthMeters: cmToMeters(measurements.torsoLengthCm),
    legLengthMeters: cmToMeters(measurements.inseamCm),
    armLengthMeters: cmToMeters(measurements.armLengthCm),
    footLengthMeters: cmToMeters(measurements.footLengthCm)
  };
}

export function solveMannequinBody(
  measurements: BodyMeasurements,
  options: SolveMannequinBodyOptions = {}
): MannequinBodyModel {
  const templateId = resolveMannequinTemplateId(options.templateId);
  const diagnostics: MannequinSolverDiagnostic[] = [];
  const height = clampMeasuredMeters(measurements.heightCm, "heightCm", diagnostics);
  const rawTorso = clampMeasuredMeters(measurements.torsoLengthCm, "torsoLengthCm", diagnostics);
  const rawInseam = clampMeasuredMeters(measurements.inseamCm, "inseamCm", diagnostics);
  const headHeight = clampValue(height * 0.13, 0.18, 0.26);
  const headRadius = headHeight * 0.48;
  const neckLength = clampValue(height * 0.036, 0.045, 0.075);
  const vertical = solveVerticalSegments({ height, headHeight, neckLength, rawInseam, rawTorso, diagnostics });
  const chest = solveBodyEllipse(measurements.chestCircumferenceCm, height, 1.17, 0.72);
  const waist = solveBodyEllipse(measurements.waistCircumferenceCm, height, 1.08, 0.68);
  const hips = solveBodyEllipse(measurements.hipCircumferenceCm, height, 1.2, 0.74);
  const shoulderWidth = solveShoulderWidth(measurements.shoulderWidthCm, height, chest.radiusX, diagnostics);
  const armLength = clampMeasuredMeters(measurements.armLengthCm, "armLengthCm", diagnostics);
  const solvedArmLength = clampValue(armLength, height * 0.28, height * 0.44);
  const footLength = clampMeasuredMeters(measurements.footLengthCm, "footLengthCm", diagnostics);
  const solvedFootLength = clampValue(footLength, height * 0.1, height * 0.18);
  const shoulderY = vertical.inseam + vertical.torsoLength;
  const neckBaseY = shoulderY + neckLength * 0.16;
  const neckTopY = height - headHeight;
  const chestY = lerp(vertical.inseam, shoulderY, 0.68);
  const waistY = lerp(vertical.inseam, shoulderY, 0.38);
  const pelvisY = vertical.inseam + clampValue(vertical.torsoLength * 0.13, 0.06, 0.15);
  const ankleY = clampValue(height * 0.035, 0.045, 0.08);
  const kneeY = ankleY + (vertical.inseam - ankleY) * 0.47;
  const shoulderHalf = shoulderWidth / 2;
  const legSpacing = clampValue(hips.radiusX * 0.72, height * 0.065, height * 0.13);
  const hipHalf = legSpacing / 2;
  const upperArmLength = solvedArmLength * 0.53;
  const lowerArmLength = solvedArmLength * 0.47;
  const upperArmDrop = upperArmLength * 0.96;
  const lowerArmDrop = lowerArmLength * 0.94;
  const upperArmOut = shoulderWidth * 0.05;
  const lowerArmIn = shoulderWidth * 0.03;
  const footY = clampValue(height * 0.025, 0.035, 0.055);
  const footWidth = clampValue(solvedFootLength * 0.38, 0.07, 0.13);
  const footHeight = clampValue(height * 0.03, 0.04, 0.07);
  const leftShoulder = point(-shoulderHalf, shoulderY, 0);
  const rightShoulder = point(shoulderHalf, shoulderY, 0);
  const leftElbow = point(-shoulderHalf - upperArmOut, shoulderY - upperArmDrop, 0.015);
  const rightElbow = point(shoulderHalf + upperArmOut, shoulderY - upperArmDrop, 0.015);
  const leftWrist = point(-shoulderHalf + lowerArmIn, leftElbow.y - lowerArmDrop, 0.025);
  const rightWrist = point(shoulderHalf - lowerArmIn, rightElbow.y - lowerArmDrop, 0.025);
  const leftFootCenter = point(-hipHalf, footY, solvedFootLength * 0.2);
  const rightFootCenter = point(hipHalf, footY, solvedFootLength * 0.2);
  const landmarks: MannequinLandmarks = {
    floor: point(0, 0, 0),
    headTop: point(0, height, 0),
    headCenter: point(0, height - headHeight / 2, 0),
    neckBase: point(0, neckBaseY, 0),
    neckTop: point(0, neckTopY, 0),
    shoulderCenter: point(0, shoulderY, 0),
    leftShoulder,
    rightShoulder,
    chest: point(0, chestY, 0),
    waist: point(0, waistY, 0),
    pelvis: point(0, pelvisY, 0),
    crotch: point(0, vertical.inseam, 0),
    leftHip: point(-hipHalf, pelvisY, 0),
    rightHip: point(hipHalf, pelvisY, 0),
    leftKnee: point(-hipHalf * 0.86, kneeY, 0),
    rightKnee: point(hipHalf * 0.86, kneeY, 0),
    leftAnkle: point(-hipHalf * 0.78, ankleY, 0),
    rightAnkle: point(hipHalf * 0.78, ankleY, 0),
    leftElbow,
    rightElbow,
    leftWrist,
    rightWrist,
    leftFootCenter,
    rightFootCenter
  };
  const dimensions: MannequinBodyDimensions = {
    height,
    headHeight,
    headRadius,
    neckLength,
    neckRadius: clampValue(chest.radiusX * 0.24, 0.045, 0.07),
    shoulderRadius: clampValue(height * 0.018, 0.027, 0.043),
    shoulderWidth,
    torsoLength: vertical.torsoLength,
    inseam: vertical.inseam,
    chestRadiusX: chest.radiusX,
    chestRadiusZ: chest.radiusZ,
    waistRadiusX: waist.radiusX,
    waistRadiusZ: waist.radiusZ,
    hipRadiusX: hips.radiusX,
    hipRadiusZ: hips.radiusZ,
    upperArmLength,
    lowerArmLength,
    upperArmRadius: clampValue(chest.radiusX * 0.19, 0.032, 0.058),
    lowerArmRadius: clampValue(chest.radiusX * 0.14, 0.026, 0.047),
    upperLegLength: pelvisY - kneeY,
    lowerLegLength: kneeY - ankleY,
    thighRadius: clampValue(hips.radiusX * 0.25, 0.045, 0.078),
    calfRadius: clampValue(hips.radiusX * 0.18, 0.034, 0.06),
    legSpacing,
    footLength: solvedFootLength,
    footWidth,
    footHeight
  };

  return {
    heightMeters: height,
    templateId,
    landmarks,
    dimensions,
    guides: {
      height: { start: point(-shoulderHalf - 0.28, 0, 0), end: point(-shoulderHalf - 0.28, height, 0) },
      inseam: {
        start: point(shoulderHalf + 0.28, 0, 0),
        end: point(shoulderHalf + 0.28, vertical.inseam, 0)
      },
      shoulders: { start: leftShoulder, end: rightShoulder },
      chest: { center: landmarks.chest, radiusX: chest.radiusX * 1.08, radiusZ: chest.radiusZ * 1.1 },
      waist: { center: landmarks.waist, radiusX: waist.radiusX * 1.1, radiusZ: waist.radiusZ * 1.12 },
      hips: { center: landmarks.pelvis, radiusX: hips.radiusX * 1.1, radiusZ: hips.radiusZ * 1.12 },
      arm: { start: leftShoulder, end: leftWrist },
      foot: {
        start: point(leftFootCenter.x, footY, leftFootCenter.z - solvedFootLength * 0.5),
        end: point(leftFootCenter.x, footY, leftFootCenter.z + solvedFootLength * 0.5)
      }
    },
    diagnostics
  };
}

export function normalizeBodyMeasurements(
  values: Partial<Record<BodyMeasurementKey, number>> | null | undefined,
  templateId: MannequinTemplateId | string | null = defaultMannequinTemplateId
): BodyMeasurements {
  const templateMeasurements = measurementsForMannequinTemplate(templateId);

  return bodyMeasurementFields.reduce(
    (normalized, field) => ({
      ...normalized,
      [field.key]: sanitizeMeasurementValue(values?.[field.key], templateMeasurements[field.key])
    }),
    {} as BodyMeasurements
  );
}

export interface BodyMeasurementIssue {
  key: BodyMeasurementKey;
  message: string;
}

export interface BodyMeasurementValidationResult {
  isValid: boolean;
  issues: BodyMeasurementIssue[];
  issuesByKey: Partial<Record<BodyMeasurementKey, string>>;
}

export interface BodyMeasurementValidationOptions {
  templateId?: MannequinTemplateId | string | null;
  enforceTemplateFineTune?: boolean;
}

export function validateBodyMeasurements(
  measurements: BodyMeasurements,
  options: BodyMeasurementValidationOptions = {}
): BodyMeasurementValidationResult {
  const issues: BodyMeasurementIssue[] = [];
  const templateId = resolveMannequinTemplateId(options.templateId);

  for (const field of bodyMeasurementFields) {
    const value = measurements[field.key];

    if (!Number.isFinite(value)) {
      issues.push({ key: field.key, message: "Enter a number" });
      continue;
    }

    if (value < field.minCm || value > field.maxCm) {
      issues.push({
        key: field.key,
        message: `${field.label} must be ${field.minCm}-${field.maxCm} cm`
      });
    }

    if (options.enforceTemplateFineTune) {
      const range = fineTuneRangeForBodyMeasurement(templateId, field.key);

      if (value < range.minCm || value > range.maxCm) {
        issues.push({
          key: field.key,
          message: `${field.label} should stay ${range.minCm}-${range.maxCm} cm for this template`
        });
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    issuesByKey: issues.reduce<Partial<Record<BodyMeasurementKey, string>>>((current, issue) => {
      current[issue.key] = issue.message;
      return current;
    }, {})
  };
}

export function cmToInches(value: number) {
  return value / 2.54;
}

export function inchesToCm(value: number) {
  return value * 2.54;
}

export function measurementValueForUnit(valueCm: number, unitSystem: UnitSystem) {
  const value = unitSystem === "imperial" ? cmToInches(valueCm) : valueCm;
  return Number(value.toFixed(1));
}

export function measurementValueToCm(value: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial" ? inchesToCm(value) : value;
}

export function measurementStepForUnit(stepCm: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial" ? 0.25 : stepCm;
}

export function measurementUnitLabel(unitSystem: UnitSystem) {
  return unitSystem === "imperial" ? "in" : "cm";
}

export function bodyMeasurementsToRecord(measurements: BodyMeasurements): Record<BodyMeasurementKey, number> {
  return bodyMeasurementFields.reduce(
    (record, field) => ({
      ...record,
      [field.key]: measurements[field.key]
    }),
    {} as Record<BodyMeasurementKey, number>
  );
}

export function isMannequinTemplateId(value: string | null | undefined): value is MannequinTemplateId {
  return mannequinTemplateIds.includes(value as MannequinTemplateId);
}

export function resolveMannequinTemplateId(value: MannequinTemplateId | string | null | undefined) {
  return isMannequinTemplateId(value) ? value : defaultMannequinTemplateId;
}

export function mannequinTemplateById(value: MannequinTemplateId | string | null | undefined) {
  const templateId = resolveMannequinTemplateId(value);
  return mannequinTemplates.find((template) => template.id === templateId) ?? mannequinTemplates[4];
}

export function measurementsForMannequinTemplate(
  value: MannequinTemplateId | string | null | undefined
): BodyMeasurements {
  const templateId = resolveMannequinTemplateId(value);
  const template = mannequinTemplates.find((candidate) => candidate.id === templateId);
  return { ...(template?.measurements ?? createTemplateMeasurements("average", "average")) };
}

export function fineTuneRangeForBodyMeasurement(
  templateId: MannequinTemplateId | string | null | undefined,
  key: BodyMeasurementKey
) {
  const base = measurementsForMannequinTemplate(templateId)[key];
  const field = bodyMeasurementFields.find((candidate) => candidate.key === key);
  const delta = templateFineTuneDeltasCm[key];

  return {
    minCm: roundMeasurement(clampValue(base - delta, field?.minCm ?? 0, field?.maxCm ?? 260)),
    maxCm: roundMeasurement(clampValue(base + delta, field?.minCm ?? 0, field?.maxCm ?? 260))
  };
}

export function applyMannequinTemplateFineTune(
  templateId: MannequinTemplateId | string | null | undefined,
  values: Partial<Record<BodyMeasurementKey, number>> | null | undefined
): BodyMeasurements {
  const resolvedTemplateId = resolveMannequinTemplateId(templateId);
  const base = measurementsForMannequinTemplate(resolvedTemplateId);

  return bodyMeasurementFields.reduce((measurements, field) => {
    const range = fineTuneRangeForBodyMeasurement(resolvedTemplateId, field.key);
    const value = values?.[field.key];

    return {
      ...measurements,
      [field.key]:
        typeof value === "number" && Number.isFinite(value)
          ? roundMeasurement(clampValue(value, range.minCm, range.maxCm))
          : base[field.key]
    };
  }, {} as BodyMeasurements);
}

export function cmToMeters(value: number) {
  return value / 100;
}

interface BodyEllipse {
  radiusX: number;
  radiusZ: number;
}

interface VerticalSegmentInput {
  diagnostics: MannequinSolverDiagnostic[];
  headHeight: number;
  height: number;
  neckLength: number;
  rawInseam: number;
  rawTorso: number;
}

interface VerticalSegments {
  inseam: number;
  torsoLength: number;
}

function createMannequinTemplateGrid(): MannequinTemplateOption[][] {
  return mannequinTemplateHeights.map((heightClass) =>
    mannequinTemplateBuilds.map((buildClass) => {
      const heightLabel = labelForClass(heightClass);
      const buildLabel = labelForClass(buildClass);

      return {
        id: `${heightClass}_${buildClass}` as MannequinTemplateId,
        label: `${heightLabel} ${buildLabel}`,
        heightClass,
        heightLabel,
        buildClass,
        buildLabel,
        measurements: createTemplateMeasurements(heightClass, buildClass)
      };
    })
  );
}

function createTemplateMeasurements(
  heightClass: MannequinTemplateHeight,
  buildClass: MannequinTemplateBuild
): BodyMeasurements {
  const heightCm = templateHeightBaselinesCm[heightClass];
  const heightRatio = heightCm / templateHeightBaselinesCm.average;
  const build = templateBuildBaselinesCm[buildClass];
  const heightGirthAdjustment = (heightCm - templateHeightBaselinesCm.average) * 0.04;
  const shoulderAdjustment = (heightCm - templateHeightBaselinesCm.average) * 0.08;

  return {
    heightCm,
    shoulderWidthCm: roundMeasurement(build.shoulderWidthCm + shoulderAdjustment),
    chestCircumferenceCm: roundMeasurement(build.chestCircumferenceCm + heightGirthAdjustment),
    waistCircumferenceCm: roundMeasurement(build.waistCircumferenceCm + heightGirthAdjustment),
    hipCircumferenceCm: roundMeasurement(build.hipCircumferenceCm + heightGirthAdjustment),
    torsoLengthCm: roundMeasurement(61 * heightRatio),
    inseamCm: roundMeasurement(81 * heightRatio),
    armLengthCm: roundMeasurement(62 * heightRatio),
    footLengthCm: roundMeasurement(27 * heightRatio)
  };
}

function labelForClass(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function circumferenceToRadiusMeters(value: number) {
  return value / (100 * Math.PI * 2);
}

function clampMeasuredMeters(
  valueCm: number,
  key: BodyMeasurementKey,
  diagnostics: MannequinSolverDiagnostic[]
) {
  const field = bodyMeasurementFields.find((candidate) => candidate.key === key);
  const minMeters = cmToMeters(field?.minCm ?? 0);
  const maxMeters = cmToMeters(field?.maxCm ?? 260);
  const valueMeters = cmToMeters(valueCm);
  const clamped = clampValue(valueMeters, minMeters, maxMeters);

  if (clamped !== valueMeters) {
    diagnostics.push({
      key,
      message: `${field?.label ?? key} was clamped to the supported mannequin range`
    });
  }

  return clamped;
}

function solveVerticalSegments(input: VerticalSegmentInput): VerticalSegments {
  const available = Math.max(input.height - input.headHeight - input.neckLength, input.height * 0.66);
  const measuredTotal = input.rawInseam + input.rawTorso;
  const rawLegShare = measuredTotal > 0 ? input.rawInseam / measuredTotal : 0.57;
  const legShare = clampValue(rawLegShare, 0.49, 0.63);
  const minTorso = input.height * 0.27;
  const maxTorso = input.height * 0.43;
  let inseam = available * legShare;
  let torsoLength = available - inseam;

  if (torsoLength < minTorso) {
    torsoLength = minTorso;
    inseam = available - torsoLength;
  }

  if (torsoLength > maxTorso) {
    torsoLength = maxTorso;
    inseam = available - torsoLength;
  }

  if (Math.abs(available - measuredTotal) > 0.025 || rawLegShare !== legShare) {
    input.diagnostics.push({
      key: "proportions",
      message: "Height, torso, and inseam were reconciled into one coherent body proportion model"
    });
  }

  return {
    inseam: Math.max(inseam, input.height * 0.34),
    torsoLength: Math.max(torsoLength, input.height * 0.24)
  };
}

function solveBodyEllipse(valueCm: number, height: number, widthScale: number, depthScale: number): BodyEllipse {
  const radius = circumferenceToRadiusMeters(valueCm);

  return {
    radiusX: clampValue(radius * widthScale, height * 0.062, height * 0.16),
    radiusZ: clampValue(radius * depthScale, height * 0.04, height * 0.12)
  };
}

function solveShoulderWidth(
  valueCm: number,
  height: number,
  chestRadiusX: number,
  diagnostics: MannequinSolverDiagnostic[]
) {
  const measured = clampMeasuredMeters(valueCm, "shoulderWidthCm", diagnostics);
  const minWidth = Math.max(height * 0.18, chestRadiusX * 2.05);
  const maxWidth = height * 0.36;
  const solved = clampValue(measured, minWidth, maxWidth);

  if (solved !== measured) {
    diagnostics.push({
      key: "shoulderWidthCm",
      message: "Shoulder width was reconciled against chest width to keep the torso readable"
    });
  }

  return solved;
}

function point(x: number, y: number, z: number): MannequinPoint {
  return { x, y, z };
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundMeasurement(value: number) {
  return Number(value.toFixed(1));
}

function sanitizeMeasurementValue(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
